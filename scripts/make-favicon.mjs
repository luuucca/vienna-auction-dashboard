/**
 * make-favicon.mjs
 * Composites the AX logomark in brand gold onto a deep-black canvas
 * (matches the website's --bg-base). Larger fill ratio than the
 * earlier white version so the mark reads clearly at 16-32 px.
 * Output: public/favicon.png (512×512).
 */
import sharp from 'sharp';
import fs from 'node:fs';

const SRC = 'public/logo.png';
const OUT = 'public/favicon.png';
const SIZE = 512;
const PADDING = 0.02;          // 2% margin — logo edge-to-edge after trim
const BG    = { r: 0x0c, g: 0x0c, b: 0x0c, alpha: 1 };  // --bg-base
const GOLD  = { r: 0xd4, g: 0xaf, b: 0x37, alpha: 1 };  // --gold

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`source ${SRC} missing`); process.exit(1);
  }
  const inner = Math.round(SIZE * (1 - PADDING * 2));

  // 1. Trim transparent borders so the AX glyph itself, not the
  //    canvas it was drawn on, decides what "edge-to-edge" means.
  //    Then resize to the inner box.
  const logoBuf = await sharp(SRC)
    .trim()                            // strip empty alpha border
    .resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // 2. Build a solid-gold tile of the same dimensions, then mask it
  //    with the logo's alpha via `dest-in`. Result: the logo's opaque
  //    shape, but now painted gold instead of dark grey.
  const goldLogo = await sharp({
    create: { width: inner, height: inner, channels: 4, background: GOLD },
  })
    .composite([{ input: logoBuf, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 3. Place the gold mark centered on the black canvas.
  await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: BG },
  })
    .composite([{ input: goldLogo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(OUT);

  const stat = fs.statSync(OUT);
  console.log(`✓ wrote ${OUT} (${(stat.size / 1024).toFixed(1)} KB, ${SIZE}×${SIZE})`);
}

main().catch(e => { console.error(e); process.exit(1); });
