/**
 * translate-descriptions-deepl.mjs
 * Re-translate yellowbird-new descriptions using DeepL Free API (de→zh).
 * Quality is much better than Google Translate.
 */
import fs from 'fs';

// Secrets loaded from env vars or local fallback for convenience.
// Set NOTION_TOKEN, DEEPL_KEY, and optionally NOTION_DATABASE_ID before running.
const NOTION_TOKEN  = process.env.NOTION_TOKEN || 'PUT_YOUR_NOTION_TOKEN_HERE';
const DB_ID         = process.env.NOTION_DATABASE_ID || '35f419f4-d42d-8009-8961-c86cdc5087bb';
const DEEPL_KEY     = process.env.DEEPL_KEY || 'PUT_YOUR_DEEPL_KEY_HERE';
const DEEPL_URL     = 'https://api-free.deepl.com/v2/translate';

if (NOTION_TOKEN.startsWith('PUT_') || DEEPL_KEY.startsWith('PUT_')) {
  console.error('请先设置 NOTION_TOKEN 和 DEEPL_KEY 环境变量。');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

const DISTRICT_NAMES = {
  1: 'Innere Stadt', 2: 'Leopoldstadt', 3: 'Landstraße', 4: 'Wieden', 5: 'Margareten',
  6: 'Mariahilf', 7: 'Neubau', 8: 'Josefstadt', 9: 'Alsergrund', 10: 'Favoriten',
  11: 'Simmering', 12: 'Meidling', 13: 'Hietzing', 14: 'Penzing', 15: 'Rudolfsheim-Fünfhaus',
  16: 'Ottakring', 17: 'Hernals', 18: 'Währing', 19: 'Döbling', 20: 'Brigittenau',
  21: 'Floridsdorf', 22: 'Donaustadt', 23: 'Liesing',
};

// ─── DeepL translator ─────────────────────────────────────────────────────────
async function deeplTranslate(text, sourceLang = 'DE', targetLang = 'ZH') {
  if (!text || !text.trim()) return '';

  // DeepL accepts up to 128KB per request, but ≤30000 chars is comfortable.
  // For very long inputs, chunk at paragraph boundaries.
  const chunks = [];
  if (text.length <= 30000) {
    chunks.push(text);
  } else {
    const paras = text.split(/\n\n+/);
    let buf = '';
    for (const p of paras) {
      if ((buf + '\n\n' + p).length > 30000) {
        if (buf) chunks.push(buf);
        buf = p;
      } else {
        buf = buf ? buf + '\n\n' + p : p;
      }
    }
    if (buf) chunks.push(buf);
  }

  const out = [];
  for (const chunk of chunks) {
    const body = new URLSearchParams();
    body.append('text', chunk);
    body.append('source_lang', sourceLang);
    body.append('target_lang', targetLang);
    body.append('preserve_formatting', '1');
    // tag_handling not used — our input is plain text with **markdown**

    const r = await fetch(DEEPL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    if (!r.ok) {
      const err = await r.text();
      throw new Error(`DeepL ${r.status}: ${err.slice(0, 200)}`);
    }
    const data = await r.json();
    out.push((data.translations || []).map(t => t.text).join(''));
    await sleep(150); // light throttle
  }
  return out.join('\n\n');
}

// Batch translate an array of short strings in ONE request (DeepL allows up to 50 texts)
async function deeplBatch(texts, sourceLang = 'DE', targetLang = 'ZH') {
  if (!texts.length) return [];
  const body = new URLSearchParams();
  for (const t of texts) body.append('text', t);
  body.append('source_lang', sourceLang);
  body.append('target_lang', targetLang);
  body.append('preserve_formatting', '1');

  const r = await fetch(DEEPL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  if (!r.ok) throw new Error(`DeepL batch ${r.status}`);
  const data = await r.json();
  return (data.translations || []).map(t => t.text);
}

// ─── Description builder (same template as before) ────────────────────────────
function buildDescription(d, translatedBody, translatedFeatures) {
  const districtName = DISTRICT_NAMES[d.district] || '';
  const priceLabel = d.mode === 'Sale' ? '售价' : '月租';
  const priceVal = d.mode === 'Sale'
    ? `€${Math.round(d.price).toLocaleString()}`
    : `€${d.price.toFixed(2).replace(/\.00$/, '')}/月`;

  const header = `📍 **维也纳 ${d.district} 区${districtName ? ' · ' + districtName : ''} · ${d.rooms || '?'} 室 · ${d.sqm}㎡**`;

  const meta = [
    d.sqm     ? `· 居住面积 **${d.sqm}㎡**` : null,
    d.rooms   ? `· **${d.rooms} 室**`       : null,
    d.floor   ? `· 楼层 ${d.floor}`          : null,
    d.buildYear ? `· 建造年份 ${d.buildYear}` : null,
    d.energy  ? `· 能源等级 **${d.energy.replace(/,/g, '.')}**` : null,
  ].filter(Boolean);

  let out = header + '\n\n';
  if (meta.length) out += '**🏠 基本信息**\n' + meta.join('\n') + '\n\n';

  if (translatedFeatures && translatedFeatures.length) {
    out += '**✨ 装修设施**\n' + translatedFeatures.map(f => '· ' + f).join('\n') + '\n\n';
  }

  out += '**📝 详细描述**\n' + translatedBody + '\n\n';
  out += `**💰 ${priceLabel}**\n· **${priceVal}**`;
  return out;
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

async function updateDescription(pageId, text) {
  const r = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH', headers,
    body: JSON.stringify({ properties: { Description: { rich_text: splitRichText(text) } } }),
  });
  return { ok: r.ok, data: r.ok ? null : await r.json() };
}

function getText(prop) {
  if (!prop) return '';
  if (prop.title) return prop.title.map(t => t.plain_text).join('');
  if (prop.rich_text) return prop.rich_text.map(t => t.plain_text).join('');
  return '';
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const sourceData = JSON.parse(fs.readFileSync('.tmp/yellowbird-new.json', 'utf8'));
  console.log(`Source: ${sourceData.length} German descriptions to re-translate via DeepL\n`);

  console.log('查询所有 Notion 页面...');
  const allPages = await queryAll();
  console.log(`Notion: ${allPages.length} 套\n`);

  // Match by (district, sqm, rooms, price) — fall back to (district, price) for edge cases
  function findPage(d) {
    let p = allPages.find(p =>
      p.properties.District?.number === d.district &&
      Math.abs((p.properties.Sqm?.number ?? -1) - (d.sqm ?? -1)) < 0.5 &&
      Math.abs((p.properties.Rooms?.number ?? -1) - (d.rooms ?? -1)) < 0.5 &&
      Math.abs((p.properties.Price?.number ?? 0) - (d.price ?? 0)) < 1
    );
    if (p) return p;
    // Fallback: district + price
    return allPages.find(p =>
      p.properties.District?.number === d.district &&
      Math.abs((p.properties.Price?.number ?? 0) - (d.price ?? 0)) < 1
    );
  }

  let ok = 0, fail = 0, skipped = 0;
  for (let i = 0; i < sourceData.length; i++) {
    const d = sourceData[i];
    const page = findPage(d);
    if (!page) {
      console.log(`[${i+1}/${sourceData.length}] ${d.id}: 未匹配 (D=${d.district} SQM=${d.sqm} R=${d.rooms} P=${d.price})`);
      skipped++;
      continue;
    }

    const title = getText(page.properties['名称']);
    process.stdout.write(`[${i+1}/${sourceData.length}] ${title.slice(0, 48)}... `);

    try {
      // Translate body
      const translatedBody = await deeplTranslate(d.descText);

      // Translate features in one batch request
      let translatedFeatures = [];
      if (d.features && d.features.length) {
        translatedFeatures = await deeplBatch(d.features);
      }

      const newDesc = buildDescription(d, translatedBody, translatedFeatures);
      const res = await updateDescription(page.id, newDesc);
      if (res.ok) { console.log('✓'); ok++; }
      else        { console.log('✗', res.data?.message); fail++; }
    } catch (e) {
      console.log('✗', e.message);
      fail++;
    }
    await sleep(250);
  }

  console.log(`\n===== 完成 =====`);
  console.log(`成功 ${ok} | 失败 ${fail} | 未匹配 ${skipped}`);

  // Show final DeepL usage
  try {
    const u = await fetch('https://api-free.deepl.com/v2/usage', {
      headers: { Authorization: `DeepL-Auth-Key ${DEEPL_KEY}` },
    });
    const used = await u.json();
    console.log(`\nDeepL 用量: ${used.character_count.toLocaleString()} / ${used.character_limit.toLocaleString()} 字符`);
  } catch {}
}

main().catch(err => { console.error(err); process.exit(1); });
