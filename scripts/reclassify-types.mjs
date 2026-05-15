/**
 * reclassify-types.mjs
 *
 * Re-classifies every Active Notion listing into the corrected Type set:
 *   公寓 | Haus | 出租楼 | 商铺 | 车库
 *
 * Strategy:
 *   1. Build a per-listing classifier that reads from the original
 *      German source (when available in .tmp/*.json) AND the stored
 *      Chinese description (Notion `Description` rich_text).
 *   2. Match Notion pages by (district, sqm, rooms, price) tuple to
 *      source records. Pages without a match still get reclassified
 *      via the Chinese-only fallback.
 *   3. PATCH only when the Type would actually change.
 *
 * NOTE: writing "Haus" to a Notion select field auto-creates the option
 * the first time, so no manual schema edit is needed.
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

// ─── Classifier ──────────────────────────────────────────────────────────────
// Strong signal = title OR first bolded heading in description.
// Body matches are only used when nothing in the headline matched — and even
// then, body keywords like "Zinshaus" / "Tiefgarage" frequently refer to the
// building an apartment is IN, not the unit being sold. So body matching is
// kept conservative.

const HEADLINE_RULES = [
  {
    type: '车库',
    re: /\b(Tiefgaragenplatz|Garagenplatz|Stellplatz(?:paket)?|Garagenpaket|Parkplatzpaket|Stellplätze[\s-]+\d+\s+Tiefgarag)\b/i,
    // Chinese fallback disabled — apartments often have "车库空间" as a
    // section header for parking info. We rely on German source instead.
    zh: null,
  },
  {
    type: 'Haus',
    // explicit house types only — "Gründerzeithaus" / "Zinshaus" excluded
    re: /\b(Einfamilienhaus|Reihenhaus|Reihenmittelhaus|Reihenendhaus|Doppelhaus(?:hälfte)?|Stadthaus|Bauernhaus|Bungalow|Landhaus|Cottage|Villa\b)/i,
    zh: /独栋别墅|独立屋|联排别墅|排屋|双拼别墅|郊区别墅|独栋住宅|半独立别墅/,
  },
  {
    type: '出租楼',
    re: /\b(Zinshaus|Mietshaus|Mehrfamilienhaus|Wohn-?\s?(?:und|&)\s?Geschäftshaus|Anlageobjekt|Apartmentprojekt|Apartment-?Investment|Apartmentnutzung)\b/i,
    zh: /出租楼|多户住宅|投资楼|公寓投资项目|公寓楼\b/,
  },
  {
    type: '商铺',
    re: /\b(Geschäftslokal|Geschäftsfläche|Bürofläche|Praxisräume|Lagerhalle|Werkstatt|Gewerbeobjekt|Gastronomieobjekt|Hotelobjekt|Produktionshalle)\b/i,
    zh: /^\s*(?:📍\s*)?\*\*?(商铺|商业铺位|店面|写字楼|工业地产|临街铺面)/m,
  },
];

// Strong "this IS the unit being sold" body patterns. These must contain
// "zum Verkauf" / "zum Kauf" / "wird verkauft" / "bietet" near the keyword.
const BODY_OBJECT_RE = {
  'Haus':   /(?:zum Verkauf|zum Kauf|wird verkauft|bietet|gelangt)\s[^.]{0,80}\b(Einfamilienhaus|Reihenhaus|Doppelhaus(?:hälfte)?|Stadthaus|Bungalow|Villa)\b/i,
  '出租楼': /(?:zum Verkauf|zum Kauf|gelangt|bietet)\s[^.]{0,80}\b(Zinshaus|Mietshaus|Mehrfamilienhaus|Anlageobjekt)\b/i,
};

function firstHeadline(descDE) {
  if (!descDE) return '';
  // 1) First **bold** block at the start
  const m = descDE.match(/^\s*(?:\*\*([^*\n]{3,140})\*\*)/);
  if (m) return m[1];
  // 2) First non-empty line, capped
  const line = descDE.split(/\n/).map(l => l.trim()).find(l => l.length > 8);
  return line ? line.slice(0, 200) : '';
}

function classify({ titleDE = '', descDE = '', descZH = '', features = [], rooms = 0, sqm = 0, hasSource = false }) {
  const headline = `${titleDE}\n${firstHeadline(descDE)}`;
  const body = descDE.slice(0, 2500);
  const zhAll = descZH.slice(0, 2500);

  // Veto guards based on numeric signals
  const isMultiRoom = rooms >= 1;       // has at least one room → not pure garage
  const isLargeWholeBuilding = rooms === 0 && sqm >= 200;

  // ── A. Strong headline signal ──────────────────────────────────────
  for (const r of HEADLINE_RULES) {
    if (!r.re.test(headline) && !(r.zh && r.zh.test(zhAll.slice(0, 200)))) continue;
    // Apply vetoes
    if (r.type === '车库' && isMultiRoom) continue;
    if (r.type === '商铺' && isMultiRoom && !/Geschäftslokal|Geschäftsfläche|Bürofläche/i.test(headline)) continue;
    if (r.type === '出租楼' && rooms > 0 && rooms < 5 && sqm < 200) continue;
    return r.type;
  }

  // ── B. Body "this is the unit" patterns (very conservative) ────────
  for (const [type, re] of Object.entries(BODY_OBJECT_RE)) {
    if (re.test(body)) {
      if (type === '出租楼' && rooms > 0 && rooms < 5 && sqm < 200) continue;
      return type;
    }
  }

  // ── C. Chinese description fallback — ONLY when no source available ──
  // (DeepL sometimes mistranslates "Gründerzeithaus" → "独栋别墅", so
  // skip Chinese-text matching if we have authoritative German source.)
  if (!hasSource) {
    for (const r of HEADLINE_RULES) {
      if (!r.zh || !r.zh.test(zhAll)) continue;
      if (r.type === '车库' && isMultiRoom) continue;
      if (r.type === '商铺' && isMultiRoom) continue;
      if (r.type === '出租楼' && rooms > 0 && rooms < 5 && sqm < 200) continue;
      return r.type;
    }
  }

  // ── D. Numeric fallback for whole-building 0-room large listings ──
  // 0 rooms + huge sqm = whole building (Zinshaus / Anlageobjekt)
  if (isLargeWholeBuilding) {
    // If we can find any Zinshaus/Anlageobjekt mention anywhere
    if (/Zinshaus|Anlageobjekt|Mehrfamilienhaus/i.test(body)) return '出租楼';
    if (/出租楼|多户住宅|投资楼/.test(zhAll)) return '出租楼';
  }

  // ── E. No positive signal — return null so caller preserves ─────
  return null;
}

// ─── Notion helpers ──────────────────────────────────────────────────────────
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

async function patchType(pageId, type) {
  const r = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH', headers,
    body: JSON.stringify({ properties: { Type: { select: { name: type } } } }),
  });
  return r.ok;
}

function getTitle(p) { return p.properties?.['名称']?.title?.[0]?.plain_text || ''; }
function getDesc(p)  { return (p.properties?.Description?.rich_text || []).map(t => t.plain_text).join(''); }

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  // Load all known source data
  const sources = [];
  for (const f of ['.tmp/valerto-all.json', '.tmp/yellowbird-new.json', '.tmp/yellowbird-data.json']) {
    if (fs.existsSync(f)) {
      const arr = JSON.parse(fs.readFileSync(f, 'utf8'));
      sources.push(...arr);
    }
  }
  console.log(`Source records (Valerto + Yellowbird): ${sources.length}`);

  // Index sources by (district, sqm, rooms, price) for matching
  // Notion stores rooms=0 as null → readers see -1; treat both as 0
  const norm = (n) => (n == null || n < 0 ? 0 : n);
  const key = (d, s, r, p) => `${d}|${Math.round(s)}|${norm(r)}|${Math.round(p)}`;
  const sourceMap = new Map();
  for (const s of sources) {
    if (s.error) continue;
    sourceMap.set(key(s.district, s.sqm, s.rooms, s.price), s);
  }
  console.log(`Indexed: ${sourceMap.size} unique source listings`);

  const pages = await queryAll();
  console.log(`Notion Active: ${pages.length}\n`);

  const summary = { '公寓': 0, 'Haus': 0, '出租楼': 0, '商铺': 0, '车库': 0 };
  const changes = [];

  for (const p of pages) {
    const D = p.properties.District?.number ?? -1;
    const S = p.properties.Sqm?.number ?? -1;
    const R = p.properties.Rooms?.number ?? -1;
    const P = p.properties.Price?.number ?? -1;
    const oldType = p.properties.Type?.select?.name || '';
    const k = key(D, S, R, P);
    const src = sourceMap.get(k);

    const detected = classify({
      titleDE: src?.titleDE || '',
      descDE:  src?.descText || '',
      descZH:  getDesc(p),
      features: src?.features || [],
      rooms: R > 0 ? R : 0,
      sqm: S > 0 ? S : 0,
      hasSource: !!src,
    });
    // No positive signal: keep existing type (avoid wrecking 0-room
    // investment listings whose source data was lost). If page has no
    // type at all, default to 公寓.
    const newType = detected || oldType || '公寓';

    summary[newType] = (summary[newType] || 0) + 1;
    if (newType !== oldType) {
      changes.push({ pageId: p.id, title: getTitle(p), oldType, newType, D, S, R, P, hasSrc: !!src });
    }
  }

  console.log('═'.repeat(50));
  console.log('新分类分布：');
  for (const [k, v] of Object.entries(summary)) console.log(`  ${k}: ${v}`);
  console.log();
  console.log(`需要变更：${changes.length} 套`);
  console.log('═'.repeat(50));
  for (const c of changes.slice(0, 30)) {
    console.log(`  ${c.oldType || '(空)'} → ${c.newType}  [${c.D}区/${c.S}㎡/${c.R}室]  ${c.hasSrc?'★':'·'}  ${c.title.slice(0,50)}`);
  }
  if (changes.length > 30) console.log(`  …还有 ${changes.length - 30} 套`);
  console.log('═'.repeat(50));

  // ── Apply changes ──────────────────────────────────────────────────────────
  if (process.argv.includes('--dry-run')) {
    console.log('\n(dry-run: 未实际写入)');
    return;
  }

  console.log('\n开始写入 Notion...\n');
  let ok = 0, fail = 0;
  for (let i = 0; i < changes.length; i++) {
    const c = changes[i];
    process.stdout.write(`[${i+1}/${changes.length}] ${c.oldType || '(空)'} → ${c.newType}... `);
    const success = await patchType(c.pageId, c.newType);
    if (success) { console.log('✓'); ok++; } else { console.log('✗'); fail++; }
    await sleep(150);
  }
  console.log(`\n===== 完成 ===== 成功 ${ok} | 失败 ${fail}`);
}

main().catch(e => { console.error(e); process.exit(1); });
