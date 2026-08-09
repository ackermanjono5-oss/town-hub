import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT_DIR = 'C:/Users/SACHIN/OneDrive/Desktop/screenshots';
mkdirSync(OUT_DIR, { recursive: true });

const BASE = 'https://sea-express.vercel.app';
const PAGES = [
  { path: '/', file: 'tablet-01-home.png', height: 1500 },
  { path: '/directory', file: 'tablet-02-restaurants.png', height: 2560 },
  { path: '/businesses', file: 'tablet-03-businesses.png', height: 2560 },
  { path: '/accommodation', file: 'tablet-04-accommodation.png', height: 2560 },
  { path: '/sos', file: 'tablet-05-sos.png', height: 1750 },
];

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 2560 } });

  for (const { path, file, height } of PAGES) {
    await page.setViewportSize({ width: 1600, height });
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const outPath = `${OUT_DIR}/${file}`;
    await page.screenshot({ path: outPath });
    console.log('Saved', outPath);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
