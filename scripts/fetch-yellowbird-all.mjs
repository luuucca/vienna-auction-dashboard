/**
 * fetch-yellowbird-all.mjs
 * Step 1 (v2): Fetch ALL pages → all listing meta → all detail pages
 * Output: .tmp/yellowbird-all.json
 */
import fs from 'fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (compatible; aoxiong-import)';

const PLZ_DISTRICT = (plz) => parseInt(plz.slice(1, 3));

// ─── Parse a listing card from list page HTML ─────────────────────────────────
function parseCard(card) {
  const id = (card.match(/objektdetail\/(\d+)/) || [])[1];
  const title = (card.match(/<a[^>]*title="Immobilie im Detail">([^<]+)</) || [])[1]?.trim() || '';
  const plz = (card.match(/<span class="zip-city">(\d{4})/) || [])[1] || '';
  const rooms = parseFloat(((card.match(/info-rooms[\s\S]*?list-item-value">\s*([\d.,]+)/) || [])[1] || '0').replace(',', '.'));
  const sqmRaw = (card.match(/info-surface[\s\S]*?list-item-value">\s*ca\.?\s*([\d.,]+)\s*m/) || [])[1];
  const sqm = sqmRaw ? parseFloat(sqmRaw.replace(/\./g, '').replace(',', '.')) : 0;
  const priceMatch = card.match(/list-item-desc">\s*(Kaufpreis|Bruttomiete|Miete|Hauptmiete|Netto-Miete|Pacht)[\s\S]*?list-item-value">\s*([\d.,]+)\s*€/);
  const mode = priceMatch && /Kaufpreis/i.test(priceMatch[1]) ? 'Sale' : 'Rent';
  const price = priceMatch ? parseFloat(priceMatch[2].replace(/\./g, '').replace(',', '.')) : 0;
  return { id, titleDE: title, plz, district: PLZ_DISTRICT(plz), rooms, sqm, mode, price };
}

function parseAllCards() {
  let allHtml = '';
  for (let p = 1; p <= 5; p++) allHtml += fs.readFileSync(`.tmp/yb-list${p}.html`, 'utf8');
  const cards = allHtml.match(/<div class="realty-wrapper[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g) || [];
  const seen = new Set();
  const out = [];
  for (const c of cards) {
    const parsed = parseCard(c);
    if (!parsed.id || seen.has(parsed.id)) continue;
    // Vienna-only safety filter: PLZ must be 1xxx (1010-1230), district 1-23
    if (!parsed.plz || !/^1\d{3}$/.test(parsed.plz)) continue;
    if (parsed.district < 1 || parsed.district > 23) continue;
    seen.add(parsed.id);
    out.push(parsed);
  }
  return out;
}

// ─── Detail page extractors (same as before) ──────────────────────────────────
function extractDescription(html) {
  const m = html.match(/realty-detail-description[\s\S]*?<div class="panel-body[^"]*">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
  return m ? m[1].trim() : '';
}
function extractFeatures(html) {
  const m = html.match(/realty-detail-features[\s\S]*?<ul class="features-list[^"]*">([\s\S]*?)<\/ul>/);
  if (!m) return [];
  return [...m[1].matchAll(/<li>([^<]+)<\/li>/g)].map(x => x[1].trim());
}
function extractEnergyHWB(html) {
  const m = html.match(/HWB<\/span>\s*<span[^>]*>\s*([A-G][^<]*?\d+\.\d+\s*kWh)/);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}
function extractImages(html) {
  const re = /storage\.justimmo\.at\/thumb\/[a-f0-9]+\/fc_h1080_mwebp_w1920\/[a-zA-Z0-9_]+\.(?:jpg|jpeg|webp|png)/g;
  const matches = html.match(re) || [];
  const seen = new Set();
  const out = [];
  for (const url of matches) {
    const id = url.split('/').pop();
    if (!seen.has(id)) { seen.add(id); out.push('https://' + url); }
  }
  return out;
}
function extractBuildYear(html) {
  const m = html.match(/BAUJAHR:?\s*<\/li>\s*<li>([^<]+)/i) || html.match(/Baujahr[^a-z]*?(\d{4})/i);
  if (!m) return null;
  const y = (m[1] || m[0]).match(/\d{4}/);
  return y ? parseInt(y[0]) : null;
}
function extractFloor(html) {
  const m = html.match(/STOCKWERK:?\s*[<\/li>]*([^<]+)/i);
  return m ? m[1].trim() : '';
}
function extractStreet(html) {
  // From JSON-LD if available
  const m = html.match(/"streetAddress":\s*"([^"]+)"/);
  return m ? m[1].trim() : '';
}
function htmlToText(html) {
  return html
    .replace(/<\/(p|div|h\d|ul|li)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '· ')
    .replace(/<strong>/gi, '**').replace(/<\/strong>/gi, '**')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&auml;/g, 'ä').replace(/&ouml;/g, 'ö').replace(/&uuml;/g, 'ü')
    .replace(/&Auml;/g, 'Ä').replace(/&Ouml;/g, 'Ö').replace(/&Uuml;/g, 'Ü')
    .replace(/&szlig;/g, 'ß').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

async function fetchDetail(id) {
  const r = await fetch(`https://www.yellowbird-immo.at/objektdetail/${id}?from=1951927`, {
    headers: { 'User-Agent': UA }
  });
  return r.text();
}

async function main() {
  const cards = parseAllCards();
  console.log(`从列表页解析得 ${cards.length} 套\n`);

  // Skip the 20 we already imported
  const ALREADY = new Set(['16698400','16698286','16688470','16703443','16724890','16556386','16547689','16551868','16551964','16552195','16552300','16552312','16552327','16619008','16712944','14729931','16708009','14756400','15412090','16686709']);

  const toFetch = cards.filter(c => !ALREADY.has(c.id));
  console.log(`已导入 ${cards.length - toFetch.length} 套，新增 ${toFetch.length} 套需要抓取\n`);

  const out = [];
  for (let i = 0; i < toFetch.length; i++) {
    const c = toFetch[i];
    process.stdout.write(`[${i+1}/${toFetch.length}] ${c.id} (${c.mode}, ${c.plz}, ${c.rooms}室, ${c.sqm}㎡)... `);
    try {
      const html = await fetchDetail(c.id);
      const descHtml = extractDescription(html);
      const descText = htmlToText(descHtml);
      const features = extractFeatures(html);
      const energy = extractEnergyHWB(html);
      const images = extractImages(html);
      const buildYear = extractBuildYear(html);
      const floor = extractFloor(html);
      const street = extractStreet(html);

      out.push({
        ...c,
        buildYear, floor, street: '',
        descText, features, energy, images,
        url: `https://www.yellowbird-immo.at/objektdetail/${c.id}`,
      });
      console.log(`✓ ${images.length} 张图 | ${descText.length} 字`);
      await sleep(700);
    } catch (e) {
      console.log('✗', e.message);
      out.push({ ...c, error: String(e) });
    }
  }

  fs.writeFileSync('.tmp/yellowbird-new.json', JSON.stringify(out, null, 2), 'utf8');
  console.log(`\n→ 写入 .tmp/yellowbird-new.json (${out.length} 套)`);
}

main();
