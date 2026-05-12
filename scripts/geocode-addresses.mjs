/**
 * geocode-addresses.mjs
 * 用 Nominatim (OpenStreetMap) 为所有近似坐标的房源补充精确坐标
 * 运行：node scripts/geocode-addresses.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, '..', 'public', 'data', 'auctions.json');
const DELAY = 1100; // Nominatim 要求 1 秒/次
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

async function geocode(address) {
  // Strip Austrian postal code + city prefix: "1190 Wien Villenweg 46" → "Villenweg 46"
  const streetOnly = address
    .replace(/^\d{4}\s+\S+\s+/, '')   // remove "1190 Wien " prefix
    .replace(/\s*\/\s*/g, ', ')        // "Str. 10/Gasse 5" → "Str. 10, Gasse 5"
    .trim();

  try {
    let hit = await nominatim(streetOnly);

    // Fallback for multi-street addresses: try just the first street
    if (!hit && streetOnly.includes(',')) {
      const firstStreet = streetOnly.split(',')[0].trim();
      await sleep(DELAY);
      hit = await nominatim(firstStreet);
    }

    if (hit) {
      return { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon), displayName: hit.display_name };
    }
  } catch (e) {
    console.warn(`  geocode 失败: ${e.message}`);
  }
  return null;
}

async function main() {
  const auctions = JSON.parse(readFileSync(PATH, 'utf8'));
  const toGeocode = auctions.filter(a => a.geocodeSource === 'approximate');

  console.log(`共 ${auctions.length} 条，其中 ${toGeocode.length} 条需要精确坐标`);
  console.log('使用 Nominatim (OpenStreetMap)，每条间隔 1.1 秒...\n');

  let ok = 0, fail = 0;

  for (let i = 0; i < auctions.length; i++) {
    const a = auctions[i];
    if (a.geocodeSource !== 'approximate') continue;

    process.stdout.write(`[${ok + fail + 1}/${toGeocode.length}] ${a.address.substring(0, 50)}...`);
    await sleep(DELAY);

    const result = await geocode(a.address);
    if (result && isFinite(result.lat) && isFinite(result.lng)) {
      auctions[i].latitude = result.lat;
      auctions[i].longitude = result.lng;
      auctions[i].geocodeSource = 'official';
      console.log(` ✓ (${result.lat.toFixed(5)}, ${result.lng.toFixed(5)})`);
      ok++;
    } else {
      console.log(' ✗ 未找到');
      fail++;
    }
  }

  writeFileSync(PATH, JSON.stringify(auctions, null, 2), 'utf8');
  console.log(`\n完成：精确 ${ok} 条，失败 ${fail} 条 → 已写回 auctions.json`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
