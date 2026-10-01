/**
 * Downloads the official logo for every national chain that appears in the
 * Garden Route directories, from that brand's own website.
 *
 * The OpenStreetMap import records chains under their shop name only
 * ("Edgars", "Mossel Bay Toyota") with no website, so there is nothing to
 * resolve a logo from automatically. This script pairs each brand with its
 * official domain by hand — once — then fetches and bundles the icon that
 * domain publishes, and regenerates lib/garden-route/brand-logos.ts.
 *
 * `match` is a regular-expression source string tested against a listing
 * name. Keep them word-bounded: a bare "Game" would match "Gameplay Cafe".
 *
 * Run:  node scripts/fetch-brand-logos.mjs
 */

import { mkdir, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { fetchBestIcon, fetchWithTimeout, mapLimit, slugify } from './lib/icon-fetch.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'logos', 'brands');
const OUT_FILE = join(ROOT, 'lib', 'garden-route', 'brand-logos.ts');

const CONCURRENCY = 8;

/**
 * Brands whose own site sits behind a WAF that refuses automated requests.
 * For these, `asset` points at the logo in that brand's public brand record,
 * which serves credentialed URLs that can be downloaded. Tried only after
 * the brand's own site fails.
 */
const FALLBACK_ASSET = {
  // Banks and Sasol: their own sites sit behind a WAF that refuses
  // automated requests, same as the entries below. These are the
  // credentialed brand-record URLs, which do allow a direct download.
  'ABSA': 'https://cdn.brandfetch.io/idIIZJY7QN/w/800/h/800/theme/light/logo.png?c=1bxcolmzvmckh245tkp99jdsjv0Ypr22ysT',
  'FNB': 'https://cdn.brandfetch.io/idMm5AKGl0/w/800/h/800/theme/dark/logo.png?c=1bxcolmzvmckh245tkp99jdsjv0Ypr22ysT',
  'Nedbank': 'https://cdn.brandfetch.io/idxlIXRGcY/w/800/h/816/theme/dark/logo.png?c=1bxcolmzvmckh245tkp99jdsjv0Ypr22ysT',
  'Capitec': 'https://cdn.brandfetch.io/id-nzL804J/w/800/h/117/theme/dark/logo.png?c=1bxcolmzvmckh245tkp99jdsjv0Ypr22ysT',
  'Sasol': 'https://cdn.brandfetch.io/idIMMBpVNv/w/820/h/335/theme/dark/logo.png?c=1bxcolmzvmckh245tkp99jdsjv0Ypr22ysT',
  'TotalEnergies': 'https://cdn.brandfetch.io/idcH-S_tZv/w/820/h/597/theme/dark/logo.png',
  'Edgars': 'https://cdn.brandfetch.io/idRonZOdBE/w/530/h/110/theme/dark/logo.png',
  'Vodacom': 'https://cdn.brandfetch.io/id3kX4bIO4/w/820/h/820/theme/dark/logo.png',
  'Audi': 'https://cdn.brandfetch.io/idW2NumpEj/w/400/h/400/theme/dark/icon.png',
  'Foschini': 'https://cdn.brandfetch.io/idy4buC310/w/909/h/909/theme/dark/icon.png',
  'MTN': 'https://cdn.brandfetch.io/idtdXB-ogi/w/800/h/533/theme/dark/logo.png',
  'Telkom': 'https://cdn.brandfetch.io/idxpZovbTe/w/434/h/230/theme/dark/logo.png',
  'Truworths': 'https://cdn.brandfetch.io/id6sSsMdc4/w/240/h/240/theme/dark/icon.jpeg',
  'PEP': 'https://cdn.brandfetch.io/id9iqV5J-K/w/820/h/250/theme/dark/logo.png',
  'Shoprite': 'https://cdn.brandfetch.io/idK3eR1dqf/w/1170/h/316/theme/dark/logo.png',
  'Builders': 'https://cdn.brandfetch.io/id2JYW6xgp/w/316/h/316/theme/dark/logo.png',
  'Game': 'https://cdn.brandfetch.io/idCxZBd5NN/w/160/h/160/theme/dark/logo.png',
};

const ASSET_TOKEN = 'c=1bxcolmzvmckh245tkp99jdsjv0Ypr22ysT';

/** name -> official domain. `match` is tested case-insensitively. */
const BRANDS = [
  // Motoring
  // Fuel, banking and postal brands. These arrived with the business
  // import's amenity widening — petrol stations, banks and ATMs were absent
  // from the directory entirely before that, so none of them had a logo.
  { name: 'Engen', domain: 'engen.co.za', match: '\\bengen\\b' },
  { name: 'Shell', domain: 'shell.co.za', match: '\\bshell\\b' },
  { name: 'Caltex', domain: 'caltex.com', match: '\\bcaltex\\b' },
  { name: 'Sasol', domain: 'sasol.com', match: '\\bsasol\\b' },
  { name: 'TotalEnergies', domain: 'totalenergies.co.za', match: '\\btotal(energies)?\\b' },
  { name: 'Astron Energy', domain: 'astronenergy.co.za', match: '\\bastron\\b' },
  { name: 'BP', domain: 'bp.com', match: '\\bbp\\b' },
  { name: 'ABSA', domain: 'absa.co.za', match: '\\babsa\\b' },
  { name: 'FNB', domain: 'fnb.co.za', match: '\\bfnb\\b|first national bank' },
  { name: 'Nedbank', domain: 'nedbank.co.za', match: '\\bnedbank\\b' },
  { name: 'Standard Bank', domain: 'standardbank.co.za', match: 'standard bank' },
  { name: 'Capitec', domain: 'capitecbank.co.za', match: '\\bcapitec\\b' },
  { name: 'SA Post Office', domain: 'postoffice.co.za', match: '\\bpost office\\b|\\bsapo\\b' },
  { name: 'PostNet', domain: 'postnet.co.za', match: '\\bpostnet\\b' },
  { name: 'Toyota', domain: 'toyota.co.za', match: '\\btoyota\\b' },
  { name: 'Volkswagen', domain: 'vw.co.za', match: '\\bvolkswagen\\b|\\bvw\\b' },
  { name: 'BMW', domain: 'bmw.co.za', match: '\\bbmw\\b' },
  { name: 'Audi', domain: 'audi.co.za', match: '\\baudi\\b' },
  { name: 'Hyundai', domain: 'hyundai.co.za', match: '\\bhyundai\\b' },
  { name: 'Nissan', domain: 'nissan.co.za', match: '\\bnissan\\b' },
  { name: 'Ford', domain: 'ford.co.za', match: '\\bford\\b' },
  { name: 'Suzuki', domain: 'suzukiauto.co.za', match: '\\bsuzuki\\b' },
  { name: 'Peugeot', domain: 'peugeot.co.za', match: '\\bpeugeot\\b' },
  { name: 'GWM', domain: 'gwm.co.za', match: '\\bgwm\\b' },
  { name: 'Haval', domain: 'haval.co.za', match: '\\bhaval\\b' },
  { name: 'Auto Pedigree', domain: 'autopedigree.co.za', match: '\\bauto\\s*pedigree\\b' },
  { name: 'Midas', domain: 'midas.co.za', match: '\\bmidas\\b' },
  { name: 'Tiger Wheel & Tyre', domain: 'twt.co.za', match: '\\btiger wheel\\b' },

  // Fuel & convenience
  { name: 'Sasol', domain: 'sasol.com', match: '\\bsasol\\b' },
  { name: 'Shell', domain: 'shell.co.za', match: '\\bshell\\b' },
  { name: 'TotalEnergies', domain: 'totalenergies.co.za', match: '\\bbonjour\\b|\\btotalgaz\\b' },
  { name: 'FreshStop', domain: 'freshstop.co.za', match: '\\bfreshstop\\b' },

  // Telecom
  { name: 'Vodacom', domain: 'vodacom.co.za', match: '\\bvodacom\\b' },
  { name: 'MTN', domain: 'mtn.co.za', match: '\\bmtn\\b' },
  { name: 'Telkom', domain: 'telkom.co.za', match: '\\btelkom\\b' },
  { name: 'Cell C', domain: 'cellc.co.za', match: '\\bcell[-\\s]?c\\b' },

  // Groceries & liquor
  { name: 'Shoprite', domain: 'shoprite.co.za', match: '^shoprite\\b' },
  { name: 'OK Foods', domain: 'okfoods.co.za', match: '\\bok (grocer|minimark)\\b' },
  { name: 'Food Lover’s Market', domain: 'foodloversmarket.co.za', match: '\\bfood\\s*lovers?\\b' },
  { name: 'Liquor City', domain: 'liquorcity.co.za', match: '\\bliquor city\\b' },
  { name: 'Eskort', domain: 'eskort.com', match: '\\beskort\\b' },

  // Clothing & footwear
  { name: 'Ackermans', domain: 'ackermans.co.za', match: '\\backermans\\b' },
  { name: 'Edgars', domain: 'edgars.co.za', match: '\\bedgars\\b' },
  { name: 'Truworths', domain: 'truworths.co.za', match: '\\btruworths\\b' },
  { name: 'Foschini', domain: 'foschini.co.za', match: '\\bfoschini\\b' },
  { name: 'Markham', domain: 'markham.co.za', match: '\\bmarkham\\b' },
  { name: 'Jet', domain: 'jet.co.za', match: '^jet$|^jet\\b(?!line)' },
  { name: 'PEP', domain: 'pepstores.com', match: '^pep\\b' },
  { name: 'Mr Price Home', domain: 'mrphome.com', match: '\\bmrp? ?price home\\b|^mrp home$' },
  { name: 'Cotton On', domain: 'cottonon.com', match: '\\bcotton on\\b' },
  { name: 'Adidas', domain: 'adidas.co.za', match: '\\badidas\\b' },
  { name: 'Cape Union Mart', domain: 'capeunionmart.co.za', match: '\\bcape union mart\\b' },
  { name: 'Sportscene', domain: 'sportscene.co.za', match: '\\bsportscene\\b' },
  { name: 'Totalsports', domain: 'totalsports.co.za', match: '\\btotal ?sports\\b' },
  { name: 'Rip Curl', domain: 'ripcurl.co.za', match: '\\brip curl\\b' },
  { name: 'Hi-Tec', domain: 'hi-tec.com', match: '\\bhi-?tec\\b' },
  { name: 'Sunglass Hut', domain: 'sunglasshut.com', match: '\\bsunglass hut\\b' },
  { name: 'Exact', domain: 'exact.co.za', match: '^exact$' },

  // Home, furniture & DIY
  { name: 'Builders', domain: 'builders.co.za', match: '\\bbuilders (express|home|warehouse)\\b' },
  { name: 'Pennypinchers', domain: 'pennypinchers.co.za', match: '\\bpennypinchers\\b' },
  { name: 'Mica', domain: 'mica.co.za', match: '\\bmica\\b' },
  { name: 'CTM', domain: 'ctm.co.za', match: '^ctm$' },
  { name: 'Tile Africa', domain: 'tileafrica.co.za', match: '\\btile africa\\b' },
  { name: 'Italtile', domain: 'italtile.co.za', match: '\\bitaltile\\b' },
  { name: 'Bathroom Bizarre', domain: 'bathroombizarre.co.za', match: '\\bbathroom bizarre\\b' },
  { name: 'Coricraft', domain: 'coricraft.co.za', match: '\\bcoricraft\\b' },
  { name: 'Weylandts', domain: 'weylandts.co.za', match: '\\bweylandts\\b' },
  { name: 'Furniture City', domain: 'furniturecity.co.za', match: '\\bfurniture city\\b' },
  { name: 'UFO Furniture', domain: 'ufofurniture.co.za', match: '\\bufo furniture\\b' },
  { name: 'Dial-a-Bed', domain: 'dialabed.co.za', match: '\\bdial-?a-?bed\\b' },
  { name: 'Lewis', domain: 'lewisstores.co.za', match: '^lewis$' },
  { name: 'Ellerines', domain: 'ellerines.co.za', match: '\\bellerines\\b' },
  { name: 'Outdoor Warehouse', domain: 'outdoorwarehouse.co.za', match: '\\boutdoor warehouse\\b' },
  { name: 'Crazy Store', domain: 'crazystore.co.za', match: '\\bcrazy store\\b' },
  { name: 'Crazy Plastics', domain: 'crazyplastics.co.za', match: '\\bcrazy plastics\\b' },

  // Hotels & lodging
  { name: 'Protea Hotels', domain: 'marriott.com', match: '\\bprotea\\b' },
  { name: 'Garden Court', domain: 'tsogosun.com', match: '\\bgarden court\\b' },
  { name: 'Tsogo Sun', domain: 'tsogosun.com', match: '\\bbeacon island\\b' },
  { name: 'Conrad', domain: 'hilton.com', match: '\\bconrad\\b' },
  { name: 'Island Vibe', domain: 'islandvibe.co.za', match: '^island vibe\\b' },

  // Restaurant chains — one asset covers every branch on the route.
  { name: 'Steers', domain: 'steers.co.za', match: '\\bsteers\\b' },
  { name: 'Wimpy', domain: 'wimpy.co.za', match: '\\bwimpy\\b' },
  { name: 'KFC', domain: 'kfc.co.za', match: '\\bkfc\\b' },
  { name: 'Debonairs Pizza', domain: 'debonairspizza.co.za', match: '\\bdebonairs\\b' },
  { name: 'Spur', domain: 'spur.co.za', match: '\\bspur\\b' },
  { name: 'McDonald\'s', domain: 'mcdonalds.co.za', match: '\\bmcdonald' },
  { name: 'Ocean Basket', domain: 'oceanbasket.com', match: '\\bocean\\s*basket\\b' },
  { name: 'Vida e Caffe', domain: 'vidaecaffe.com', match: '\\bvida\\s*e\\s*caff' },
  { name: 'Fishaways', domain: 'fishaways.co.za', match: '\\bfishaways\\b' },
  { name: 'Panarottis', domain: 'panarottis.co.za', match: '\\bpanarottis\\b' },
  { name: 'Milky Lane', domain: 'milkylane.co.za', match: '\\bmilky\\s*lane\\b' },
  { name: 'Burger King', domain: 'burgerking.co.za', match: '\\bburger\\s*king\\b' },
  { name: 'Nando\'s', domain: 'nandos.co.za', match: '\\bnando' },
  { name: 'Dros', domain: 'dros.co.za', match: '^dros\\b' },
  { name: 'Zebro\'s', domain: 'zebros.co.za', match: '\\bzebro' },
  { name: 'Simply Asia', domain: 'simplyasia.co.za', match: '\\bsimply\\s*asia\\b' },
  { name: 'Hungry Lion', domain: 'hungrylion.co.za', match: '\\bhungry\\s*lion\\b' },
  { name: 'Seattle Coffee Company', domain: 'seattlecoffeecompany.co.za', match: '\\bseattle\\s*coffee\\b' },
  { name: 'Scooters Pizza', domain: 'scooterspizza.co.za', match: '^scooters\\b' },

  // Tech, books & services
  { name: 'Incredible Connection', domain: 'incredible.co.za', match: '\\bincredible connection\\b' },
  { name: 'Game', domain: 'game.co.za', match: '^game$' },
  { name: 'Bargain Books', domain: 'bargainbooks.co.za', match: '\\bbargain books\\b' },
  { name: 'Exclusive Books', domain: 'exclusivebooks.co.za', match: '\\bexclusive books\\b' },
  { name: 'PNA', domain: 'pna.co.za', match: '^pna\\b' },
  { name: 'Sorbet', domain: 'sorbet.co.za', match: '^sorbet\\b' },
  { name: 'Skin PhD', domain: 'skinphd.com', match: '\\bskin ?phd\\b' },
  { name: 'Mugg & Bean', domain: 'muggandbean.co.za', match: '\\bmugg ?& ?bean\\b' },
  { name: 'Old Mutual', domain: 'oldmutual.co.za', match: '\\bold mutual\\b' },
  { name: 'Flight Centre', domain: 'flightcentre.co.za', match: '\\bflight centre\\b' },
  { name: 'Petshop Science', domain: 'petshopscience.co.za', match: '\\bpetshop science\\b' },
  { name: 'Kloppers', domain: 'kloppers.co.za', match: '\\bkloppers\\b' },
];

/** Downloads a curated logo URL and normalises it like fetchBestIcon does. */
async function fetchDirectAsset(url) {
  try {
    const sep = url.includes('?') ? '&' : '?';
    const res = await fetchWithTimeout(`${url}${sep}${ASSET_TOKEN}`);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(buf).metadata();
    if (!meta.width) return null;
    const png = await sharp(buf)
      .trim({ threshold: 10 })
      .resize({
        width: 256,
        height: 128,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png({ compressionLevel: 9 })
      .toBuffer();
    return { png, source: url, size: `${meta.width}x${meta.height}` };
  } catch {
    return null;
  }
}

async function main() {
  console.log(`Fetching official logos for ${BRANDS.length} brands…`);
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const found = [];
  let done = 0;
  await mapLimit(BRANDS, CONCURRENCY, async (brand) => {
    let result = await fetchBestIcon(brand.domain);
    if (!result && FALLBACK_ASSET[brand.name]) {
      result = await fetchDirectAsset(FALLBACK_ASSET[brand.name]);
    }
    done += 1;
    if (result) {
      const file = `${slugify(brand.name)}.png`;
      await writeFile(join(OUT_DIR, file), result.png);
      found.push({ ...brand, file });
      console.log(`  [${done}/${BRANDS.length}] ok    ${brand.name}  (${result.size})`);
    } else {
      console.log(`  [${done}/${BRANDS.length}] none  ${brand.name}  (${brand.domain})`);
    }
  });

  found.sort((a, b) => a.name.localeCompare(b.name));
  const entries = found
    .map(
      (b) =>
        `  { name: '${b.name.replace(/'/g, "\\'")}', pattern: /${b.match}/i, logo: 'logos/brands/${b.file}' },`
    )
    .join('\n');

  await writeFile(
    OUT_FILE,
    `// Generated by scripts/fetch-brand-logos.mjs — do not edit by hand.
// Official chain logos, downloaded from each brand's own website and bundled
// so they work offline. Matched against a listing name, so one asset serves
// every branch and new branches are picked up automatically on re-import.
export const BRAND_LOGOS: { name: string; pattern: RegExp; logo: string }[] = [
${entries}
];
`,
    'utf8'
  );

  console.log(`\nResolved ${found.length}/${BRANDS.length} brands.`);
  console.log(`Wrote ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
