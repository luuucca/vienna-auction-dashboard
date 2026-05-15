/**
 * push-yellowbird-all.mjs
 * Auto-translate German descriptions → structured Chinese, then push to Notion.
 */
import fs from 'fs';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_DATABASE_ID || '35f419f4-d42d-8009-8961-c86cdc5087bb';
if (!NOTION_TOKEN) { console.error('请设置 NOTION_TOKEN 环境变量'); process.exit(1); }
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

// ─── Translation dictionary (German → Chinese) ────────────────────────────────
// Order matters: longer phrases first to avoid partial overrides
const DICT = [
  // Section labels
  ['HIGHLIGHTS', '亮点'], ['Highlights', '亮点'],
  ['INFOS ZUR WOHNUNG', '房源信息'], ['INFOS ZUM HAUS', '房源信息'], ['INFOS ZUR IMMOBILIE', '房源信息'],
  ['DETAILS', '详细信息'], ['Details', '详细信息'],
  ['AUSSTATTUNG', '装修设施'], ['Ausstattung', '装修设施'],
  ['KOSTEN', '费用'], ['Kosten', '费用'],
  ['Kurzfazit', '简评'],
  ['NEBENKOSTEN', '额外费用'],
  ['INFRASTRUKTUR', '周边配套'], ['VERKEHRSANBINDUNG', '交通'],

  // Common labels
  ['STOCKWERK', '楼层'], ['Stockwerk', '楼层'],
  ['BAUJAHR', '建造年份'], ['Baujahr', '建造年份'],
  ['BEZIEHBAR', '可入住'], ['Beziehbar', '可入住'],
  ['WOHNFLÄCHE', '居住面积'], ['Wohnfläche', '居住面积'],
  ['ZIMMER', '房间数'], ['Zimmer', '房间数'],
  ['BADEZIMMER', '浴室'], ['Badezimmer', '浴室'], ['Bad', '浴室'],
  ['TOILETTE', '卫生间'], ['Toilette', '卫生间'],
  ['HEIZUNG', '暖气'], ['Heizung', '暖气'],
  ['LIFT', '电梯'], ['Lift', '电梯'],
  ['KÜCHE', '厨房'], ['Küche', '厨房'],
  ['BALKON', '阳台'], ['Balkon', '阳台'], ['Balkone', '阳台'],
  ['TERRASSE', '露台'], ['Terrasse', '露台'],
  ['GARTEN', '花园'], ['Garten', '花园'],
  ['GARAGE', '车库'], ['Garage', '车库'],
  ['KELLER', '地下室'], ['Keller', '地下室'], ['KELLERABTEIL', '地下储藏间'],
  ['ABSTELLRAUM', '储物间'], ['Abstellraum', '储物间'],
  ['ORIENTIERUNG', '朝向'], ['Orientierung', '朝向'],
  ['RAUMHÖHE', '层高'], ['Raumhöhe', '层高'],
  ['MÖBLIERT', '家具'], ['Möbliert', '家具'],
  ['WASCHMASCHINENANSCHLUSS', '洗衣机接口'],
  ['KINDERWAGEN', '婴儿车'], ['FAHRRADABSTELLRAUM', '自行车存放室'], ['FAHRRADRAUM', '自行车存放室'],
  ['KLASSE', '能源等级'],
  ['KAUFPREIS', '售价'], ['Kaufpreis', '售价'],
  ['BRUTTOMIETE', '毛租金'], ['Bruttomiete', '毛租金'], ['BRUTTO MIETE', '毛租金'],
  ['NETTOMIETE', '净租金'], ['Nettomiete', '净租金'],
  ['MIETE', '租金'], ['Miete', '租金'],
  ['BETRIEBSKOSTEN', '月度管理费'], ['Betriebskosten', '月度管理费'],
  ['REPERATURFOND', '维修基金'], ['Reparaturrücklage', '维修基金'], ['REPARATURFOND', '维修基金'],
  ['Kaution', '押金'], ['KAUTION', '押金'],
  ['Provision', '中介费'], ['PROVISION', '中介费'],
  ['Grundbucheintragung', '房产登记费'], ['Grunderwerbsteuer', '土地交易税'],
  ['provisionsfrei', '免中介费'], ['Provisionsfrei', '免中介费'],

  // Common values / phrases
  ['ab sofort', '即可入住'], ['Ab sofort', '即可入住'], ['Sofort', '即可入住'],
  ['nach Absprache', '协商确定'],
  ['Altbau', 'Altbau 古典老宅'],
  ['Neubau', '新建'], ['Erstbezug', '首次入住'],
  ['Dachgeschoss', '顶楼'], ['Dachgeschosswohnung', '顶楼公寓'],
  ['Maisonette', '跃层'],
  ['Etagenheizung', '分户供暖'],
  ['Zentralheizung', '中央供暖'],
  ['Fernwärme', '区域供热'],
  ['Fußbodenheizung', '地暖'],
  ['Gas Etagenheizung', '燃气分户供暖'],
  ['Gas-Etagenheizung', '燃气分户供暖'],
  ['Klimaanlage', '空调'],
  ['Walk-in-Dusche', '步入式淋浴'], ['Walk-In-Dusche', '步入式淋浴'], ['Walkin-Dusche', '步入式淋浴'],
  ['Dusche', '淋浴'],
  ['Badewanne', '浴缸'], ['Waschbecken', '洗手台'],
  ['Einbauküche', '嵌入式厨房'],
  ['Wohnküche', '客厅厨房一体'], ['offene Küche', '开放式厨房'],
  ['Vollausgestattet', '全配置'], ['Komplettküche', '全配置厨房'],
  ['Parkett', '复合木地板'], ['Fischgrätparkett', '鱼骨纹复合木地板'], ['Fertigparkett', '成品复合木地板'],
  ['Fliesen', '瓷砖'],
  ['Hofseitig', '内院侧'], ['hofseitig', '内院侧'], ['innenhofseitig', '内院侧'],
  ['straßenseitig', '临街'],
  ['Ruhelage', '安静地段'], ['absolute Ruhelage', '绝对安静地段'],
  ['Verkehrsanbindung', '交通'],
  ['U-Bahn', '地铁'], ['Straßenbahn', '有轨电车'],
  ['S-Bahn', 'S 城铁'],
  ['Bus', '公交'], ['ÖBB', 'ÖBB 国铁'],
  ['Tram', '有轨电车'],
  ['Lebensmittelgeschäfte', '生鲜超市'], ['Lebensmittelgeschäft', '生鲜超市'],
  ['Supermärkte', '超市'], ['Supermarkt', '超市'],
  ['Schulen', '学校'], ['Schule', '学校'],
  ['Restaurants', '餐厅'], ['Restaurant', '餐厅'],
  ['Banken', '银行'], ['Bank', '银行'],
  ['Bäckereien', '面包店'], ['Bäckerei', '面包店'],
  ['Cafes', '咖啡店'], ['Cafés', '咖啡店'], ['Cafe', '咖啡店'],
  ['Apotheken', '药店'], ['Apotheke', '药店'],
  ['Park', '公园'], ['Grünanlage', '绿地'],
  ['ausgezeichnete Infrastruktur', '完善的周边配套'],
  ['Top Verkehrsanbindung', '顶级交通配套'],
  ['Top Anbindung', '顶级交通配套'], ['Topanbindung', '顶级交通配套'],

  ['nahe', '靠近'], ['unmittelbarer Nähe', '步行可达'],
  ['gut geschnittene Räume', '户型方正'], ['gut geschnitten', '户型方正'],
  ['hochwertige Ausstattung', '高品质装修'], ['hochwertig saniert', '高品质翻新'],
  ['Lebenswerteste Stadt der Welt', '世界最宜居城市'],
  ['LEBENSWERTESTEN Stadt der Welt', '世界最宜居城市'],
  ['Helle, große Räume', '明亮宽敞的房间'], ['Heller, großer Raum', '明亮宽敞的房间'],
  ['Helle und gut geschnittene Räume', '明亮且户型方正'],
  ['perfekter Grundriß', '完美户型'], ['perfekter Grundriss', '完美户型'],
  ['guter Grundriß', '良好户型'], ['guter Grundriss', '良好户型'],
  ['Effizienter Grundriss', '高效户型'],
  ['durchdachte Raumaufteilung', '精心规划的户型'],
  ['lichtdurchflutete', '采光充足的'], ['lichtdurchflutet', '采光充足'],
  ['südseitig', '南向'], ['Südseitige', '南向'],
  ['Südseitige Ausrichtung', '南向朝向'],
  ['Südwestlich', '西南向'], ['südwestlich', '西南向'], ['Südwesten', '西南向'],
  ['Nordwest', '西北'], ['Nordosten', '东北'], ['Norden', '北'], ['Süden', '南'], ['Osten', '东'], ['Westen', '西'],
  ['Anbindung an das öffentliche Verkehrsnetz', '便捷的公共交通'],
  ['öffentliche Anbindung', '公共交通'], ['Öffentliche Anbindung', '公共交通'],
  ['attraktive', '吸引人的'], ['attraktiv', '吸引'],
  ['Eine höchst attraktive', '极具吸引力的'],
  ['Wohngefühl', '居住感受'], ['positiver Energie', '正能量氛围'],
  ['Großzügige', '宽敞的'], ['großzügig', '宽敞'],
  ['Innenhof', '内院'],
  ['Belvedere-Schlossgarten', 'Belvedere 美景宫花园'], ['Belvedere-Lage', 'Belvedere 地段'],
  ['Schwarzenbergpark', 'Schwarzenbergpark 公园'], ['Wienerwald', 'Wienerwald 维也纳森林'],
  ['Naherholungsgebiete', '休闲游憩区'],
  ['befristet', '限期'], ['unbefristet', '不限期'], ['Befristet', '限期'],
  ['Voll ausgestattete Küche', '全配厨房'], ['voll ausgestattete', '全配置'],
  ['Tischler-Küche', '木匠定制厨房'], ['Tischler', '木匠'],
  ['mit allen Geräten', '含全套电器'],
  ['Hochwertige Kombination', '高品质组合'],
  ['Vollklimatisiert', '全屋空调'], ['vollklimatisiert', '全屋空调'],
  ['hochwertiger Parkettboden', '高品质复合地板'],
  ['Mosaikfliesen', '马赛克瓷砖'],
  ['LIEBHERR und AEG', 'LIEBHERR + AEG 品牌'],
  ['LAUFEN und GEBERIT', 'LAUFEN + GEBERIT 品牌'],
  ['GROHE und LAUFEN', 'GROHE + LAUFEN 品牌'],
  ['EWE', 'EWE 品牌'],
  ['Villeroy & Boch', 'Villeroy & Boch 品牌'],
  ['Marke', '品牌'],
  ['Geräte der Marke', '品牌电器'],
  ['Bus (39A)', '公交 39A'], ['Bus 48A', '公交 48A'], ['U3', 'U3 地铁'], ['U4', 'U4 地铁'],
  ['Tram 2', '有轨电车 2 路'], ['Straßenbahnlinie 26', '有轨电车 26 路'], ['Straßenbahnlinie', '有轨电车线路'],
  ['Anzahl', '数量'],
  ['Doppel- / Mehrfachverglasung', '双层 / 多层玻璃'],
  ['Personenaufzug', '电梯'],
  ['Bad mit Fenster', '带窗户的浴室'],
  ['Bad mit WC', '浴室带卫生间'],
  ['Getrennte Toiletten', '独立卫生间'],
  ['Gäste-WC', '客用卫生间'],
  ['Grünblick', '绿景'], ['Stadtblick', '城市景观'], ['Fernblick', '远景'],
  ['Massiv', '砖石结构'],
  ['Ziegel', '砖瓦'],
  ['Satteldach', '坡屋顶'], ['Flachdach', '平屋顶'],
  ['Deckenleuchten', '吊灯'],
  ['Wasser-Elektro', '水电'], ['Elektro', '电力'],
  ['Öffenbare Fenster', '可开启窗户'],
  ['Innenliegender Sonnenschutz', '内置遮阳'], ['Außenliegender Sonnenschutz', '外置遮阳'],
  ['Blendschutz', '防眩光'],
  ['Rollstuhlgerecht', '无障碍'],
  ['Räume veränderbar', '空间可改造'],
  ['Bodendosen', '地插盒'],
  ['Brennwertkessel', '冷凝锅炉'],

  // Common joining words
  ['sowie', '以及'], ['außerdem', '此外'], ['ebenso', '同样'],
  ['befindet sich', '位于'], ['befindet', '位于'],
  ['Die Wohnung', '本套公寓'], ['Diese Wohnung', '本套公寓'], ['Diese hochwertige', '这套高品质'],
  ['Dieses', '这套'], ['Diese', '这套'],
  ['überzeugt durch', '突出优势'],
  ['vorhanden', '配备'],
  ['perfekte Anbindung', '完美交通'],
  ['perfekt', '完美'],
  ['begeistert', '令人喜爱'],
  ['absolut', '绝对'],
  ['ideal', '理想'],
  ['hervorzuheben', '突出'],
  ['durchdacht', '精心规划'],
  ['inkludiert', '已包含'], ['inkl.', '含'],
  ['JA', '是'], ['Ja', '是'], ['NEIN', '否'],
  ['ca.', '约'], ['ca ', '约 '],
  ['gepflegt', '维护良好'],
];

const NOISE_PATTERNS = [
  /In Entsprechung des FAGG[\s\S]*?(?=\n\n|$)/,
  /Wir weisen darauf hin[\s\S]*?(?=\n\n|$)/,
  /Der Vermittler ist als Doppelmakler[\s\S]*?(?=\n\n|$)/,
  /Haben Sie weitere Fragen[\s\S]*?(?=\n\n|$)/,
  /Habe ich Ihr Interesse geweckt[\s\S]*?(?=\n\n|$)/,
  /HINWEIS: VIDEOLINK verfügbar[\s\S]*?(?=\n\n|$)/,
  /HINWEIS: Bei Bedarf ist ein Video[\s\S]*?(?=\n\n|$)/,
  /Dann zögern Sie nicht länger[\s\S]*?(?=\n\n|$)/,
  /Gleich Kontakt aufnehmen[\s\S]*?(?=\n\n|$)/,
  /NEBENKOSTEN WELCHE VOM KÄUFER ZU TRAGEN SIND[\s\S]*?(?=\n\n|$)/,
];

function translate(text) {
  if (!text) return text;
  let out = text;
  // First strip noise sections (boilerplate, contact prompts)
  for (const re of NOISE_PATTERNS) out = out.replace(re, '');
  // Apply dictionary
  for (const [de, zh] of DICT) {
    // Use word-boundary-ish replacement
    out = out.split(de).join(zh);
  }
  // Common simple substitutions
  out = out
    .replace(/EUR\s+([\d.,]+)/g, '€$1')
    .replace(/m²/g, '㎡').replace(/m2/g, '㎡').replace(/qm/g, '㎡')
    .replace(/\bz\.B\./gi, '比如')
    .replace(/\bbzw\./gi, '或')
    .replace(/\bca\b/gi, '约')
    .replace(/\bzzgl\.\s*USt\./gi, '不含增值税')
    .replace(/\b20% USt\./gi, '20% 增值税')
    .replace(/\bdes Kaufpreises\b/gi, '售价')
    .replace(/\bdes KP\b/gi, '售价')
    .replace(/\bvom KP\b/gi, '售价')
    .replace(/\büber\b/gi, '通过')
    .replace(/\boder\b/gi, '或')
    .replace(/\bund\b/gi, '+')
    .replace(/\bmit\b/gi, '配')
    .replace(/\bohne\b/gi, '不含')
    .replace(/\bnach\b/gi, '后')
    .replace(/\bvon\b/gi, '从')
    .replace(/\bbis\b/gi, '到')
    .replace(/\bauf\b/gi, '在')
    .replace(/\bbeim\b/gi, '在')
    .replace(/\bzum\b/gi, '到')
    .replace(/\bzur\b/gi, '到')
    .replace(/\bdem\b/gi, '该')
    .replace(/\bder\b/gi, '这')
    .replace(/\bdas\b/gi, '该')
    .replace(/\bein\b/gi, '一')
    .replace(/\beine\b/gi, '一')
    .replace(/\bzentrale[rn]?\s*Lage\b/gi, '中心地段')
    .replace(/\bsehr gut\b/gi, '非常好')
    .replace(/\bsehr\b/gi, '非常');
  // Tidy spacing
  out = out.replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return out;
}

// ─── Build a structured Chinese description ──────────────────────────────────
function buildDescription(d) {
  const { plz, district, rooms, sqm, buildYear, floor, energy, features, mode, price, descText } = d;
  const districtName = DISTRICT_NAMES[district] || '';
  const modeText = mode === 'Sale' ? '出售' : '出租';
  const priceLabel = mode === 'Sale' ? '售价' : '月租';
  const priceVal = mode === 'Sale' ? `€${Math.round(price).toLocaleString()}` : `€${price.toFixed(2).replace(/\.00$/, '')}/月`;

  // Translate the full body
  const translated = translate(descText);

  // Build a structured header + condensed translated body
  const header = `📍 **维也纳 ${district} 区${districtName ? ' · ' + districtName : ''} · ${rooms || '?'} 室公寓 · ${sqm}㎡**\n`;

  const meta = [
    sqm ? `· 居住面积 **${sqm}㎡**` : null,
    rooms ? `· **${rooms} 室**` : null,
    floor ? `· 楼层 ${floor}` : null,
    buildYear ? `· 建造年份 ${buildYear}` : null,
    energy ? `· 能源等级 **${energy.replace(/,/g, '.')}**` : null,
  ].filter(Boolean);

  let out = header + '\n';
  if (meta.length) out += '**🏠 基本信息**\n' + meta.join('\n') + '\n\n';

  if (features && features.length) {
    const zhFeatures = features.map(f => '· ' + translate(f));
    out += '**✨ 装修设施**\n' + zhFeatures.join('\n') + '\n\n';
  }

  out += '**📝 详细描述（自动翻译）**\n' + translated + '\n\n';

  out += `**💰 ${priceLabel}**\n· **${priceVal}**`;

  return out;
}

function buildTitle(d) {
  const districtName = DISTRICT_NAMES[d.district] || '';
  const modeTag = d.mode === 'Rent' ? '【出租】' : '';
  const rooms = d.rooms ? `${d.rooms} 室` : '商办';
  const sqm = d.sqm ? `${d.sqm}㎡` : '';
  const parts = [
    `${modeTag}维也纳 ${d.district} 区`,
    districtName,
    rooms,
    sqm,
  ].filter(Boolean);
  return parts.join(' · ');
}

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Wien, Austria')}&format=json&limit=1&countrycodes=at`;
  const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'de' } });
  const data = await r.json();
  return data[0] ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
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

function splitRichText(text) {
  const chunks = [];
  let rem = text;
  while (rem.length > 0) {
    chunks.push({ text: { content: rem.slice(0, 2000) } });
    rem = rem.slice(2000);
  }
  return chunks;
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

async function main() {
  const data = JSON.parse(fs.readFileSync('.tmp/yellowbird-new.json', 'utf8'));
  console.log(`准备导入 ${data.length} 套 yellowbird 新房源...\n`);

  let ok = 0, fail = 0;
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    if (d.error || !d.id) { fail++; continue; }

    const titleZH = buildTitle(d);
    const description = buildDescription(d);
    const districtName = DISTRICT_NAMES[d.district] || '';
    const type = classifyType(d);

    console.log(`[${i+1}/${data.length}] ${titleZH}`);

    // Geocode by district
    process.stdout.write(`  → 定位 ${districtName}, ${d.plz} Wien... `);
    await sleep(1100);
    const geo = await geocode(`${districtName}, ${d.plz} Wien`);
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
      'Street':       { rich_text: [{ text: { content: '' } }] },
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
  console.log(`成功 ${ok} | 失败 ${fail}`);
}

main().catch(err => { console.error(err); process.exit(1); });
