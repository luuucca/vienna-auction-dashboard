/**
 * fix-multi-address.mjs
 * 重新对多地址条目（含"/"的地址）使用首个地址进行精确定位
 * 运行：node scripts/fix-multi-address.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, '..', 'public', 'data', 'auctions.json');
const DELAY = 1100;
const UA = 'vienna-auction-dashboard/1.0 (personal research tool)';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function nominatim(q) {
  const url = `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(q + ', Wien, Austria')}` +
    `&format=json&limit=1&countrycodes=at`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'de' },
    signal: AbortSignal.timeout(8000),
  });
  const data = await res.json();
  return data.length > 0 ? data[0] : null;
}

function firstStreet(address) {
  const streetOnly = address
    .replace(/^\d{4}\s+\S+\s+/, '')
    .trim();
  return streetOnly.split(/\s*\/\s*/)[0].trim();
}

async function main() {
  const auctions = JSON.parse(readFileSync(PATH, 'utf8'));
  const multi = auctions.filter(a => a.address && a.address.includes('/'));

  console.log(`共 ${auctions.length} 条`);
  console.log(`其中含多地址 (/) 的 ${multi.length} 条，将重新使用首个地址定位\n`);

  let ok = 0, fail = 0, skip = 0;

  for (let i = 0; i < auctions.length; i++) {
    const a = auctions[i];
    if (!a.address || !a.address.includes('/')) continue;

    const first = firstStreet(a.address);
    process.stdout.write(`[${ok + fail + skip + 1}/${multi.length}] ${first.substring(0, 50)}...`);
    await sleep(DELAY);

    try {
      const hit = await nominatim(first);
      if (hit) {
        const lat = parseFloat(hit.lat);
        const lng = parseFloat(hit.lon);
        if (isFinite(lat) && isFinite(lng)) {
          auctions[i].latitude = lat;
          auctions[i].longitude = lng;
          auctions[i].geocodeSource = 'official-first-of-multi';
          console.log(` ✓ (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
          ok++;
          continue;
        }
      }
      console.log(' ✗ 未找到');
      fail++;
    } catch (e) {
      console.log(` ✗ ${e.message}`);
      fail++;
    }
  }

  writeFileSync(PATH, JSON.stringify(auctions, null, 2));
  console.log(`\n完成：成功 ${ok}，失败 ${fail}，跳过 ${skip}`);
}

main().catch(err => { console.error(err); process.exit(1); });
