/**
 * fix-auction-coords.mjs
 * Re-geocodes any auction in public/data/auctions.json that was
 * tagged geocodeSource: "approximate" because the original fetcher
 * only split multi-street addresses on commas. Real Vienna data
 * uses slashes ("Krausegasse 23/Mautner-Markhof-Gasse 62") — the
 * fix is to try the first slash-separated street.
 */
import fs from 'node:fs';

const FILE = 'public/data/auctions.json';
const UA = 'aoxiong-website/1.0 (coords-fix)';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function nominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Wien, Austria')}&format=json&limit=1&countrycodes=at`;
  const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'de' } });
  if (!r.ok) return null;
  const data = await r.json();
  return data[0] ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
}

async function geocodeCorner(address) {
  // Strip "1110 Wien " prefix; keep just the street portion
  const stripped = address.replace(/^\d{4}\s+Wien\s+/i, '').trim();
  // Split on / OR , (some entries use either); whitespace tolerant
  const parts = stripped.split(/\s*[\/,]\s*/).filter(Boolean);
  // Try each street individually until Nominatim returns a hit
  for (const part of parts) {
    const hit = await nominatim(part);
    if (hit) return hit;
    await sleep(1100); // respect Nominatim's 1 req/s policy
  }
  // Last-ditch: try the full stripped string
  return await nominatim(stripped);
}

async function main() {
  const list = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const targets = list.filter(a => a.geocodeSource === 'approximate');
  console.log(`Found ${targets.length} approximate-coord auctions to fix`);

  let ok = 0, fail = 0;
  for (let i = 0; i < targets.length; i++) {
    const a = targets[i];
    process.stdout.write(`[${i + 1}/${targets.length}] ${a.address.slice(0, 60)}... `);
    try {
      const hit = await geocodeCorner(a.address);
      if (hit) {
        a.latitude = hit.lat;
        a.longitude = hit.lng;
        a.geocodeSource = 'official';
        console.log(`✓ (${hit.lat.toFixed(4)}, ${hit.lng.toFixed(4)})`);
        ok++;
      } else {
        console.log('✗ still no hit, leaving approximate');
        fail++;
      }
    } catch (e) {
      console.log('✗', e.message);
      fail++;
    }
    await sleep(1100);
  }

  fs.writeFileSync(FILE, JSON.stringify(list, null, 2), 'utf8');
  console.log(`\nFixed ${ok} / failed ${fail}. Wrote ${FILE}.`);
}

main().catch(e => { console.error(e); process.exit(1); });
