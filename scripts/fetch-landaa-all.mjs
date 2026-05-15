/**
 * fetch-landaa-all.mjs
 * Justimmo-powered Landaa Immobilien — Wien Sale listings only.
 * Output: .tmp/landaa-all.json
 *
 * Uses the same robust JSON-LD address extractor as fetch-valerto-all
 * (skip RealEstateAgent/Organization blocks → only read the property's
 * RealEstateListing block).
 */
import fs from 'fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (compatible; aoxiong-import)';

const BASE = 'https://www.landaa.at';
const LIST_BASE = '/immobilien';
const QUERY = '?f%5Ball%5D%5Bmarketing_type%5D=buy&f%5Ball%5D%5Bfederal_state%5D=134';

const PLZ_DISTRICT = (plz) => parseInt(plz.slice(1, 3));

// ─── List-page card parser ────────────────────────────────────────────────────
// Landaa wraps each listing in <div class="panel-wrapper"> instead of
// realty-wrapper. PLZ appears as `<span class="zip-city">1030 Wien</span>`
// (digits + " Wien"), so we capture only the leading 4 digits.
function parseCard(card) {
  const id = (card.match(/\/objekt\/(\d+)/) || [])[1];
  const title = (card.match(/<a[^>]*title="Immobilie im Detail"[^>]*>([^<]+)</) || [])[1]?.trim()
             || (card.match(/<a[^>]*class="overlay-link"[^>]*>([^<]+)</) || [])[1]?.trim()
             || (card.match(/<h3[^>]*>([^<]+)<\/h3>/) || [])[1]?.trim()
             || '';
  const plz = (card.match(/<span class="zip-city">\s*(\d{4})/) || [])[1] || '';
  const rooms = parseFloat(((card.match(/info-rooms[\s\S]*?list-item-value">\s*([\d.,]+)/) || [])[1] || '0').replace(',', '.'));
  const sqmRaw = (card.match(/info-surface[\s\S]*?list-item-value">\s*ca\.?\s*([\d.,]+)\s*m/) || [])[1];
  const sqm = sqmRaw ? parseFloat(sqmRaw.replace(/\./g, '').replace(',', '.')) : 0;
  const priceMatch = card.match(/list-item-desc">\s*(Kaufpreis|Bruttomiete|Miete|Hauptmiete|Netto-Miete|Pacht)[\s\S]*?list-item-value">\s*([\d.,]+)\s*€/);
  const mode = priceMatch && /Kaufpreis/i.test(priceMatch[1]) ? 'Sale' : 'Rent';
  const price = priceMatch ? parseFloat(priceMatch[2].replace(/\./g, '').replace(',', '.')) : 0;
  return { id, titleDE: title, plz, district: plz ? PLZ_DISTRICT(plz) : 0, rooms, sqm, mode, price };
}

async function fetchList(p) {
  const url = p === 1
    ? `${BASE}${LIST_BASE}${QUERY}`
    : `${BASE}${LIST_BASE}/p/${p}${QUERY}`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`list page ${p} → HTTP ${r.status}`);
  return r.text();
}

// ─── Detail page extractors ───────────────────────────────────────────────────
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
  const m = html.match(/HWB<\/span>\s*<span[^>]*>\s*([A-G][^<]*?\d+[.,]\d+\s*kWh)/);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}
function extractImages(html) {
  // Landaa applies a "LANDAA" watermark to their high-res images, so the
  // transform path includes `Fc_Lbr_<wm>.png_fc_h1080_mwebp_w1920` rather
  // than the clean `fc_h1080_mwebp_w1920`. Match by `w1920` to accept
  // BOTH clean (Valerto/Yellowbird) and watermarked (Landaa) variants —
  // we'd rather show Landaa's own watermarked images than no images.
  const re = /storage\.justimmo\.at\/thumb\/[a-f0-9]+\/[^"\s\/]*w1920[^"\s\/]*\/[a-zA-Z0-9_]+\.(?:jpg|jpeg|webp|png)/g;
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
// Walk all JSON-LD blocks; only trust streetAddress from the listing
// block (skip RealEstateAgent / Organization / ItemList).
function extractStreet(html) {
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)];
  for (const m of blocks) {
    let data;
    try { data = JSON.parse(m[1]); } catch { continue; }
    const types = [].concat(data['@type'] || []);
    if (types.some(t => /Agent|Organization|ItemList/i.test(t))) continue;
    const candidates = [
      data.address?.streetAddress,
      data.offers?.itemOffered?.address?.streetAddress,
      data.itemOffered?.address?.streetAddress,
    ].filter(Boolean);
    if (candidates.length) return String(candidates[0]).trim();
  }
  return '';
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
  const r = await fetch(`${BASE}/objekt/${id}${QUERY}`, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`detail ${id} → HTTP ${r.status}`);
  return r.text();
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync('.tmp')) fs.mkdirSync('.tmp');

  console.log('→ 抓取列表 page 1...');
  const p1 = await fetchList(1);
  fs.writeFileSync('.tmp/landaa-list1.html', p1, 'utf8');
  const pagesMatches = [...p1.matchAll(/\/immobilien\/p\/(\d+)/g)];
  const lastPage = pagesMatches.length ? Math.max(...pagesMatches.map(m => parseInt(m[1]))) : 1;
  console.log(`  分页：共 ${lastPage} 页`);

  for (let p = 2; p <= lastPage; p++) {
    console.log(`→ 抓取列表 page ${p}...`);
    const html = await fetchList(p);
    fs.writeFileSync(`.tmp/landaa-list${p}.html`, html, 'utf8');
    await sleep(700);
  }

  // Split on panel-wrapper boundaries; each chunk after [0] is a card.
  let allHtml = '';
  for (let p = 1; p <= lastPage; p++) allHtml += fs.readFileSync(`.tmp/landaa-list${p}.html`, 'utf8');
  const chunks = allHtml.split(/<div class="panel-wrapper"/);
  // Each card has /objekt/ID — keep only chunks containing one
  const cards = chunks.slice(1).filter(c => /\/objekt\/\d+/.test(c));
  console.log(`\n从 ${lastPage} 页解析得 ${cards.length} 张卡片`);

  const seen = new Set();
  const parsed = [];
  for (const c of cards) {
    const card = parseCard(c);
    if (!card.id || seen.has(card.id)) continue;
    // Wien-only safety filter
    if (!card.plz || !/^1\d{3}$/.test(card.plz)) continue;
    if (card.district < 1 || card.district > 23) continue;
    seen.add(card.id);
    parsed.push(card);
  }
  console.log(`去重 + 维也纳过滤后：${parsed.length} 套\n`);

  const out = [];
  for (let i = 0; i < parsed.length; i++) {
    const c = parsed[i];
    process.stdout.write(`[${i+1}/${parsed.length}] ${c.id} (${c.mode}, ${c.plz}, ${c.rooms}室, ${c.sqm}㎡)... `);
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
        buildYear, floor, street,
        descText, features, energy, images,
        url: `${BASE}/objekt/${c.id}`,
      });
      console.log(`✓ ${images.length} 张图 | ${descText.length} 字${street ? ' | street:' + street : ''}`);
      await sleep(700);
    } catch (e) {
      console.log('✗', e.message);
      out.push({ ...c, error: String(e) });
    }
  }

  fs.writeFileSync('.tmp/landaa-all.json', JSON.stringify(out, null, 2), 'utf8');
  console.log(`\n→ 写入 .tmp/landaa-all.json (${out.length} 套)`);
}

main().catch(err => { console.error(err); process.exit(1); });
