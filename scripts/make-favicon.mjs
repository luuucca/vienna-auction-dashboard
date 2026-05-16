/**
 * make-favicon.mjs
 * Composites logo.png onto a solid white background to produce a
 * favicon that reads well in both light and dark browser tabs.
 * Output: public/favicon.png (512×512 with safe margin).
 */
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';

const SRC = 'public/logo.png';
const OUT = 'public/favicon.png';
const SIZE = 512;     // favicon canvas
const PADDING = 0.16; // 16% margin so the AX mark doesn't touch edges

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`source ${SRC} missing`); process.exit(1);
  }
  const inner = Math.round(SIZE * (1 - PADDING * 2));

  // Resize logo to fit inside padded area; keep transparency.
  const logoBuf = await sharp(SRC)
    .resize({ width: inner, height: inner, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  // Composite onto white canvas
  await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite([{ input: logoBuf, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(OUT);

  const stat = fs.statSync(OUT);
  console.log(`✓ wrote ${OUT} (${(stat.size / 1024).toFixed(1)} KB, ${SIZE}×${SIZE})`);
}

main().catch(e => { console.error(e); process.exit(1); });
