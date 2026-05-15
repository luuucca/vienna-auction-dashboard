/**
 * push-valerto-all.mjs
 * Translate Valerto listings via DeepL, push to Notion with photos & coords.
 * Dedupes against existing Notion pages by (district, sqm, rooms, price) tuple.
 */
import fs from 'fs';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID        = process.env.NOTION_DATABASE_ID || '35f419f4-d42d-8009-8961-c86cdc5087bb';
const DEEPL_KEY    = process.env.DEEPL_KEY;
const DEEPL_URL    = 'https://api-free.deepl.com/v2/translate';

if (!NOTION_TOKEN || !DEEPL_KEY) {
  console.error('请先设置 NOTION_TOKEN 和 DEEPL_KEY 环境变量。');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};
const UA = 'aoxiong-website/1.0';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const DISTRICT_NAMES = {
  1: 'Innere Stadt', 2: 'Leopoldstadt', 3: 'Landstraße', 4: 'Wieden', 5: 'Margareten',
  6: 'Mariahilf', 7: 'Neubau', 8: 'Josefstadt', 9: 'Alsergrund', 10: 'Favoriten',
  11: 'Simmering', 12: 'Meidling', 13: 'Hietzing', 14: 'Penzing', 15: 'Rudolfsheim-Fünfhaus',
  16: 'Ottakring', 17: 'Hernals', 18: 'Währing', 19: 'Döbling', 20: 'Brigittenau',
  21: 'Floridsdorf', 22: 'Donaustadt', 23: 'Liesing',
};

// ─── Noise stripping (legal boilerplate, contact prompts) ─────────────────────
const NOISE_PATTERNS = [
  /In Entsprechung des FAGG[\s\S]*?(?=\n\n|$)/g,
  /Wir weisen darauf hin[\s\S]*?(?=\n\n|$)/g,
  /Der Vermittler ist als Doppelmakler[\s\S]*?(?=\n\n|$)/g,
  /Haben Sie weitere Fragen[\s\S]*?(?=\n\n|$)/g,
  /Habe ich Ihr Interesse geweckt[\s\S]*?(?=\n\n|$)/g,
  /HINWEIS: VIDEOLINK verfügbar[\s\S]*?(?=\n\n|$)/g,
  /HINWEIS: Bei Bedarf ist ein Video[\s\S]*?(?=\n\n|$)/g,
  /Dann zögern Sie nicht länger[\s\S]*?(?=\n\n|$)/g,
  /Gleich Kontakt aufnehmen[\s\S]*?(?=\n\n|$)/g,
  /Wir freuen uns auf Ihre Kontaktaufnahme[\s\S]*?(?=\n\n|$)/g,
  /Für weitere Informationen[\s\S]*?(?=\n\n|$)/g,
];

function stripNoise(text) {
  let out = text || '';
  for (const re of NOISE_PATTERNS) out = out.replace(re, '');
  return out.replace(/\n{3,}/g, '\n\n').trim();
}

// ─── DeepL ────────────────────────────────────────────────────────────────────
async function deeplTranslate(text) {
  if (!text || !text.trim()) return '';
  const chunks = [];
  if (text.length <= 30000) chunks.push(text);
  else {
    const paras = text.split(/\n\n+/);
    let buf = '';
    for (const p of paras) {
      if ((buf + '\n\n' + p).length > 30000) { if (buf) chunks.push(buf); buf = p; }
      else buf = buf ? buf + '\n\n' + p : p;
    }
    if (buf) chunks.push(buf);
  }
  const out = [];
  for (const chunk of chunks) {
    const body = new URLSearchParams();
    body.append('text', chunk);
    body.append('source_lang', 'DE');
    body.append('target_lang', 'ZH');
    body.append('preserve_formatting', '1');
    const r = await fetch(DEEPL_URL, {
      method: 'POST',
      headers: { Authorization: `DeepL-Auth-Key ${DEEPL_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!r.ok) throw new Error(`DeepL ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const data = await r.json();
    out.push((data.translations || []).map(t => t.text).join(''));
    await sleep(150);
  }
  return out.join('\n\n');
}

async function deeplBatch(texts) {
  if (!texts.length) return [];
  const body = new URLSearchParams();
  for (const t of texts) body.append('text', t);
  body.append('source_lang', 'DE');
  body.append('target_lang', 'ZH');
  body.append('preserve_formatting', '1');
  const r = await fetch(DEEPL_URL, {
    method: 'POST',
    headers: { Authorization: `DeepL-Auth-Key ${DEEPL_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!r.ok) throw new Error(`DeepL batch ${r.status}`);
  const data = await r.json();
  return (data.translations || []).map(t => t.text);
}

// ─── Description builder ──────────────────────────────────────────────────────
function buildTitle(d) {
  const districtName = DISTRICT_NAMES[d.district] || '';
  const modeTag = d.mode === 'Rent' ? '【出租】' : '';
  const rooms = d.rooms ? `${d.rooms} 室` : '商办';
  const sqm = d.sqm ? `${d.sqm}㎡` : '';
  return [`${modeTag}维也纳 ${d.district} 区`, districtName, rooms, sqm].filter(Boolean).join(' · ');
}

function buildDescription(d, translatedBody, translatedFeatures) {
  const districtName = DISTRICT_NAMES[d.district] || '';
  const priceLabel = d.mode === 'Sale' ? '售价' : '月租';
  const priceVal = d.mode === 'Sale'
    ? `€${Math.round(d.price).toLocaleString()}`
    : `€${d.price.toFixed(2).replace(/\.00$/, '')}/月`;

  const header = `📍 **维也纳 ${d.district} 区${districtName ? ' · ' + districtName : ''} · ${d.rooms || '?'} 室 · ${d.sqm}㎡**`;
  const meta = [
    d.sqm       ? `· 居住面积 **${d.sqm}㎡**` : null,
    d.rooms     ? `· **${d.rooms} 室**`       : null,
    d.floor     ? `· 楼层 ${d.floor}`          : null,
    d.buildYear ? `· 建造年份 ${d.buildYear}` : null,
    d.energy    ? `· 能源等级 **${d.energy.replace(/,/g, '.')}**` : null,
  ].filter(Boolean);

  let out = header + '\n\n';
  if (meta.length) out += '**🏠 基本信息**\n' + meta.join('\n') + '\n\n';
  if (translatedFeatures?.length) out += '**✨ 装修设施**\n' + translatedFeatures.map(f => '· ' + f).join('\n') + '\n\n';
  out += '**📝 详细描述**\n' + translatedBody + '\n\n';
  out += `**💰 ${priceLabel}**\n· **${priceVal}**`;
  return out;
}

// ─── Type classifier (shared logic — mirrors scripts/reclassify-types.mjs) ───
const HEADLINE_RULES = [
  { type: '车库',   re: /\b(Tiefgaragenplatz|Garagenplatz|Stellplatz(?:paket)?|Garagenpaket|Parkplatzpaket)\b/i },
  { type: 'Haus',   re: /\b(Einfamilienhaus|Reihenhaus|Reihenmittelhaus|Reihenendhaus|Doppelhaus(?:hälfte)?|Stadthaus|Bauernhaus|Bungalow|Landhaus|Cottage|Villa\b)/i },
  { type: '出租楼', re: /\b(Zinshaus|Mietshaus|Mehrfamilienhaus|Wohn-?\s?(?:und|&)\s?Geschäftshaus|Anlageobjekt|Apartmentprojekt|Apartment-?Investment|Apartmentnutzung)\b/i },
  { type: '商铺',   re: /\b(Geschäftslokal|Geschäftsfläche|Bürofläche|Praxisräume|Lagerhalle|Werkstatt|Gewerbeobjekt|Gastronomieobjekt|Hotelobjekt|Produktionshalle)\b/i },
];
const BODY_OBJECT_RE = {
  'Haus':   /(?:zum Verkauf|zum Kauf|wird verkauft|bietet|gelangt)\s[^.]{0,80}\b(Einfamilienhaus|Reihenhaus|Doppelhaus(?:hälfte)?|Stadthaus|Bungalow|Villa)\b/i,
  '出租楼': /(?:zum Verkauf|zum Kauf|gelangt|bietet)\s[^.]{0,80}\b(Zinshaus|Mietshaus|Mehrfamilienhaus|Anlageobjekt)\b/i,
};
function firstHeadline(descDE) {
  if (!descDE) return '';
  const m = descDE.match(/^\s*(?:\*\*([^*\n]{3,140})\*\*)/);
  if (m) return m[1];
  const line = descDE.split(/\n/).map(l => l.trim()).find(l => l.length > 8);
  return line ? line.slice(0, 200) : '';
}
function classifyType(d) {
  const titleDE = d.titleDE || '';
  const descDE  = d.descText || '';
  const rooms   = d.rooms || 0;
  const sqm     = d.sqm || 0;
  const headline = `${titleDE}\n${firstHeadline(descDE)}`;
  const body = descDE.slice(0, 2500);
  const isMultiRoom = rooms >= 1;

  for (const r of HEADLINE_RULES) {
    if (!r.re.test(headline)) continue;
    if (r.type === '车库'   && isMultiRoom) continue;
    if (r.type === '商铺'   && isMultiRoom && !/Geschäftslokal|Geschäftsfläche|Bürofläche/i.test(headline)) continue;
    if (r.type === '出租楼' && rooms > 0 && rooms < 5 && sqm < 200) continue;
    return r.type;
  }
  for (const [type, re] of Object.entries(BODY_OBJECT_RE)) {
    if (re.test(body)) {
      if (type === '出租楼' && rooms > 0 && rooms < 5 && sqm < 200) continue;
      return type;
    }
  }
  if (rooms === 0 && sqm >= 200) {
    if (/Zinshaus|Anlageobjekt|Mehrfamilienhaus/i.test(body)) return '出租楼';
  }
  return '公寓';
}

// ─── Geocoding ────────────────────────────────────────────────────────────────
async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Wien, Austria')}&format=json&limit=1&countrycodes=at`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'de' } });
    const data = await r.json();
    return data[0] ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
  } catch { return null; }
}

// ─── Notion helpers ───────────────────────────────────────────────────────────
async function queryAll() {
  const all = [];
  let cursor;
  do {
    const body = { page_size: 100 };
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

function splitRichText(text) {
  const chunks = [];
  let rem = text;
  while (rem.length > 0) {
    chunks.push({ text: { content: rem.slice(0, 2000) } });
    rem = rem.slice(2000);
  }
  return chunks;
}

async function createPage(props) {
  const r = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST', headers,
    body: JSON.stringify({ parent: { database_id: DB_ID }, properties: props }),
  });
  return { ok: r.ok, data: await r.json() };
}

async function addPhotos(pageId, urls) {
  if (!urls?.length) return true;
  const files = urls.slice(0, 100).map((url, i) => ({
    name: `photo-${i + 1}.jpg`, type: 'external', external: { url },
  }));
  const r = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH', headers,
    body: JSON.stringify({ properties: { Photos: { files } } }),
  });
  return r.ok;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const data = JSON.parse(fs.readFileSync('.tmp/valerto-all.json', 'utf8'));
  console.log(`Source: ${data.length} 套 Valerto 房源\n`);

  console.log('→ 查询现有 Notion 房源（去重检查）...');
  const existing = await queryAll();
  console.log(`  Notion 当前 ${existing.length} 套\n`);

  // Dedupe key: (district, sqm rounded, rooms, price)
  const key = (p) => {
    const D = p.properties?.District?.number ?? p.district ?? -1;
    const S = Math.round(p.properties?.Sqm?.number ?? p.sqm ?? -1);
    const R = p.properties?.Rooms?.number ?? p.rooms ?? -1;
    const P = Math.round(p.properties?.Price?.number ?? p.price ?? -1);
    return `${D}|${S}|${R}|${P}`;
  };
  const existingKeys = new Set(existing.map(key));

  let ok = 0, fail = 0, skip = 0;
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    if (d.error || !d.id) { fail++; continue; }

    const dKey = key(d);
    if (existingKeys.has(dKey)) {
      console.log(`[${i+1}/${data.length}] ${d.id} 已存在（${dKey}），跳过`);
      skip++;
      continue;
    }

    const titleZH = buildTitle(d);
    const districtName = DISTRICT_NAMES[d.district] || '';
    const type = classifyType(d);

    console.log(`[${i+1}/${data.length}] ${titleZH}`);

    // Translate body + features via DeepL
    process.stdout.write('  → DeepL 翻译... ');
    let translatedBody = '';
    let translatedFeatures = [];
    try {
      const cleanedDescDE = stripNoise(d.descText);
      translatedBody = cleanedDescDE ? await deeplTranslate(cleanedDescDE) : '';
      if (d.features?.length) translatedFeatures = await deeplBatch(d.features);
      console.log('✓');
    } catch (e) {
      console.log('✗', e.message);
      fail++;
      continue;
    }

    const description = buildDescription(d, translatedBody, translatedFeatures);

    // Geocode (street if known, else district)
    process.stdout.write(`  → 定位 ${d.street || districtName}, ${d.plz} Wien... `);
    await sleep(1100);
    const geo = await geocode(d.street ? `${d.street}, ${d.plz}` : `${districtName}, ${d.plz} Wien`);
    if (geo) console.log(`✓ (${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)})`);
    else console.log('✗');

    const props = {
      '名称':         { title:     [{ text: { content: titleZH } }] },
      'Status':       { select:    { name: 'Active' } },
      'Type':         { select:    { name: type } },
      'Mode':         { select:    { name: d.mode } },
      'District':     { number:    d.district },
      'DistrictName': { rich_text: [{ text: { content: districtName } }] },
      'PLZ':          { rich_text: [{ text: { content: d.plz } }] },
      'Street':       { rich_text: [{ text: { content: d.street || '' } }] },
      'Sqm':          { number:    d.sqm || null },
      'Rooms':        { number:    d.rooms || null },
      'Price':        { number:    d.price || null },
      'BuildYear':    { number:    d.buildYear || null },
      'Description':  { rich_text: splitRichText(description) },
    };
    if (geo) {
      props.Lat = { number: geo.lat };
      props.Lng = { number: geo.lng };
    }

    process.stdout.write('  → 创建 Notion 页面... ');
    const res = await createPage(props);
    if (!res.ok) {
      console.log('✗', res.data?.message);
      fail++;
      continue;
    }
    console.log('✓');

    if (d.images?.length) {
      process.stdout.write(`  → 添加 ${d.images.length} 张图... `);
      console.log(await addPhotos(res.data.id, d.images) ? '✓' : '✗');
    }

    ok++;
    console.log();
    await sleep(400);
  }

  console.log(`\n===== 完成 =====`);
  console.log(`新增 ${ok} | 跳过 ${skip} | 失败 ${fail}`);

  // DeepL usage
  try {
    const u = await fetch('https://api-free.deepl.com/v2/usage', {
      headers: { Authorization: `DeepL-Auth-Key ${DEEPL_KEY}` },
    });
    const used = await u.json();
    console.log(`\nDeepL 用量: ${used.character_count.toLocaleString()} / ${used.character_limit.toLocaleString()} 字符`);
  } catch {}
}

main().catch(err => { console.error(err); process.exit(1); });
