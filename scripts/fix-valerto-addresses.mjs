/**
 * fix-valerto-addresses.mjs
 *
 * Valerto's detail pages embed TWO JSON-LD blocks — the broker office
 * (RealEstateAgent, "Bertha von Suttner Gasse 8/2") AND the listing
 * itself (RealEstateListing, with only PLZ and city, never a street).
 *
 * The original fetch-valerto-all.mjs naively grabbed the first
 * `"streetAddress"` it saw, which is ALWAYS the broker's office — so
 * every Valerto listing got tagged with that bogus street and geocoded
 * to the broker's office (~48.25, 16.42).
 *
 * This script clears those wrong fields so the website stops showing
 * fake addresses. Valerto deliberately hides precise addresses
 * (`address-display-rule="fuzzy"`), so there's nothing to put back —
 * better to show nothing than a false location.
 */
import fs from 'fs';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID        = process.env.NOTION_DATABASE_ID || '35f419f4-d42d-8009-8961-c86cdc5087bb';
if (!NOTION_TOKEN) { console.error('请设置 NOTION_TOKEN 环境变量'); process.exit(1); }

const headers = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function queryAll() {
  const all = [];
  let cursor;
  do {
    const body = { page_size: 100, filter: { property: 'Status', select: { equals: 'Active' } } };
    if (cursor) body.start_cursor = cursor;
    const r = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: 'POST', headers, body: JSON.stringify(body),
    });
    const d = await r.json();
    all.push(...(d.results || []));
    cursor = d.has_more ? d.next_cursor : undefined;
  } while (cursor);
  return all;
}

async function clearAddress(pageId) {
  const r = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH', headers,
    body: JSON.stringify({
      properties: {
        Street: { rich_text: [] },
        Lat:    { number: null },
        Lng:    { number: null },
      },
    }),
  });
  return r.ok;
}

async function main() {
  const v = JSON.parse(fs.readFileSync('.tmp/valerto-all.json', 'utf8'));
  console.log(`Valerto source: ${v.length} listings`);

  // Build dedupe set from Valerto source — these are the pages to fix
  const norm = (n) => (n == null || n < 0 ? 0 : n);
  const key = (d, s, r, p) => `${d}|${Math.round(s)}|${norm(r)}|${Math.round(p)}`;
  const valertoKeys = new Set(v.filter(x => !x.error).map(x => key(x.district, x.sqm, x.rooms, x.price)));
  console.log(`Valerto unique keys: ${valertoKeys.size}`);

  const pages = await queryAll();
  console.log(`Notion Active: ${pages.length}\n`);

  // Specifically: pages with the bogus Bertha-von-Suttner address
  const BOGUS = /Bertha\s*von\s*Suttner/i;
  const targets = pages.filter(p => {
    const street = p.properties?.Street?.rich_text?.[0]?.plain_text || '';
    const D = p.properties.District?.number ?? -1;
    const S = p.properties.Sqm?.number ?? -1;
    const R = p.properties.Rooms?.number ?? -1;
    const P = p.properties.Price?.number ?? -1;
    const k = key(D, S, R, P);
    return BOGUS.test(street) || valertoKeys.has(k);
  });
  console.log(`Pages to clear: ${targets.length}\n`);

  let ok = 0, fail = 0;
  for (let i = 0; i < targets.length; i++) {
    const p = targets[i];
    const title = p.properties?.['名称']?.title?.[0]?.plain_text || '';
    process.stdout.write(`[${i+1}/${targets.length}] ${title.slice(0, 56)}... `);
    const success = await clearAddress(p.id);
    if (success) { console.log('✓'); ok++; } else { console.log('✗'); fail++; }
    await sleep(120);
  }

  console.log(`\n===== 完成 ===== 成功 ${ok} | 失败 ${fail}`);
}

main().catch(e => { console.error(e); process.exit(1); });
