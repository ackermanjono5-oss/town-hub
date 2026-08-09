import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SVG = 'C:/Users/SACHIN/AppData/Local/Temp/claude/c--RAHUL-sea-express-sea-express/ec0e9d76-3b21-41c8-b689-a8d76a6be7b8/scratchpad/feature-graphic.svg';
const ICON = join(__dirname, '..', 'public', 'icon.png');
const OUT = 'C:/Users/SACHIN/OneDrive/Desktop/feature-graphic.png';

async function main() {
  const background = await sharp(SVG).resize(1024, 500).png().toBuffer();

  const iconSize = 220;
  const icon = await sharp(ICON)
    .resize(iconSize, iconSize)
    .composite([
      {
        // rounded-corner mask so the icon reads as an app tile, not a hard square
        input: Buffer.from(
          `<svg width="${iconSize}" height="${iconSize}"><rect width="${iconSize}" height="${iconSize}" rx="44" ry="44" fill="#fff"/></svg>`
        ),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();

  await sharp(background)
    .composite([{ input: icon, left: 110, top: 140 }])
    .flatten({ background: '#0e3a63' }) // remove alpha — Play feature graphics must be opaque
    .removeAlpha()
    .png()
    .toFile(OUT);

  console.log('Wrote', OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
