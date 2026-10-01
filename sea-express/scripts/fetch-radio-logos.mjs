/**
 * Downloads each Garden Route radio station's logo from its own website into
 * public/logos/radio/, so the Radio page works offline like every other
 * directory.
 *
 * Stations are a short hand-maintained list rather than an import, so the
 * domains live here beside lib/garden-route/radio.ts. Re-run after adding a
 * station there.
 *
 * Run:  node scripts/fetch-radio-logos.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fetchBestIcon, mapLimit } from './lib/icon-fetch.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'logos', 'radio');

/** Must match the `id` of each station in lib/garden-route/radio.ts. */
const STATIONS = [
  { id: 'eden-fm', domain: 'edenfm.co.za' },
  { id: 'sfm-streek', domain: 'sfmstreek.com' },
  { id: 'algoa-fm', domain: 'algoafm.co.za' },
  { id: 'knysna-fm', domain: 'knysnafm.co.za' },
  { id: 'mc-fm', domain: 'wavebroadcasting.co.za' },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  let found = 0;

  await mapLimit(STATIONS, 4, async (station) => {
    const result = await fetchBestIcon(station.domain, { minPx: 40, outPx: 192 });
    if (result) {
      await writeFile(join(OUT_DIR, `${station.id}.png`), result.png);
      found += 1;
      console.log(`  ok    ${station.id.padEnd(14)} ${station.domain}  (${result.size})`);
    } else {
      console.log(`  none  ${station.id.padEnd(14)} ${station.domain}`);
    }
  });

  console.log(`\nResolved ${found}/${STATIONS.length} station logos.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
