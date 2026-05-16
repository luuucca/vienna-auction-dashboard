/**
 * make-favicon-ico.mjs
 * Bundles multiple PNG sizes (16/32/48/64) into a single .ico file at
 * public/favicon.ico — Google's crawler still looks here first.
 */
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'node:fs/promises';

const SRC = 'public/favicon.png'; // 512×512 white-bg variant
const OUT = 'public/favicon.ico';
const SIZES = [16, 32, 48, 64];

async function main() {
  const buffers = [];
  for (const size of SIZES) {
    buffers.push(await sharp(SRC).resize(size, size).png().toBuffer());
  }
  const ico = await pngToIco(buffers);
  await fs.writeFile(OUT, ico);
  console.log(`✓ wrote ${OUT} (${SIZES.join('/')}px → ${(ico.length / 1024).toFixed(1)} KB)`);
}

main().catch(e => { console.error(e); process.exit(1); });
