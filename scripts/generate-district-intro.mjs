/**
 * generate-district-intro.mjs
 * Per-district "neighborhood intro" video — 5s Seedance clip per
 * Vienna Bezirk. Designed to display on every listing detail page
 * as a cinematic preview of "what this district feels like".
 *
 * Drop into CLIPS array and re-run to add more districts.
 *
 * Run:
 *   set VOLCENGINE_ARK_KEY=ark-xxxxxxx
 *   node scripts/generate-district-intro.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.VOLCENGINE_ARK_KEY;
if (!KEY) { console.error('VOLCENGINE_ARK_KEY missing'); process.exit(1); }

const ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks';
const MODEL    = 'doubao-seedance-2-0-260128';
const OUT_DIR  = 'public/districts';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Prompts engineered per Bezirk — each leans on one or two visual
// landmarks plus a specific camera move so the model produces a
// district-distinctive 5s clip.
const CLIPS = [
  {
    name: '01-innere-stadt',
    text:
      '电影级慢推镜头，黄昏维也纳一区 Innere Stadt 老城核心，前景是 Stephansdom 大教堂哥特尖塔逆光剪影，' +
      '远景延伸到 Hofburg 皇宫和 Graben 步行街的暖黄色街灯。古典石板路反射光线。' +
      'Anamorphic 宽屏 16:9、4K 写实、温暖金色暮光、无人物、无字幕。5 秒。',
  },
  {
    name: '02-leopoldstadt',
    text:
      '电影级低空航拍镜头，金色傍晚维也纳 2 区 Leopoldstadt，Prater 摩天轮缓慢转动，' +
      '远景可见 Augarten 公园绿树成荫和多瑙运河水面反光，前景老 Gründerzeit 公寓屋顶。' +
      'Anamorphic 宽屏、4K 写实、金色暮光、无人物特写。5 秒。',
  },
  {
    name: '03-landstrasse',
    text:
      '电影级慢推镜头，下午阳光下维也纳 3 区 Landstraße，前景是 Belvedere 美景宫巴洛克外立面和绿色穹顶，' +
      '远景延伸到 Botanischer Garten 植物园林荫和老使馆区古典建筑立面。' +
      'Anamorphic 宽屏、4K 写实、温暖午后光线、无人物。5 秒。',
  },
  {
    name: '04-wieden',
    text:
      '电影级慢摇镜头，黄昏维也纳 4 区 Wieden，前景是 Karlskirche 卡尔教堂的橙色铜质穹顶和双柱，' +
      '远景延伸到 TU Wien 工业大学的现代玻璃建筑和 Naschmarkt 市场边缘的灯火。' +
      'Anamorphic 宽屏、4K 写实、戏剧性光线、无人物。5 秒。',
  },
  {
    name: '05-margareten',
    text:
      '电影级慢推镜头，傍晚维也纳 5 区 Margareten 居住街区，前景是 19 世纪 Gründerzeit 装饰繁复的公寓正立面，' +
      '橙色街灯刚刚亮起照亮石板路，远景隐约可见 Naschmarkt 市场尾巴和有轨电车线。' +
      'Anamorphic 宽屏、4K 写实、暖橘色暮光、无人物。5 秒。',
  },
  {
    name: '06-mariahilf',
    text:
      '电影级慢平移镜头，傍晚维也纳 6 区 Mariahilf，沿着 Mariahilfer Straße 步行街拍摄，' +
      '橱窗灯光温暖，远景可见 Mariahilfer Kirche 教堂双塔剪影。雨后的石板路反射光线。' +
      'Anamorphic 宽屏、4K 写实、温暖商业氛围、无人物特写。5 秒。',
  },
  {
    name: '07-neubau',
    text:
      '电影级慢推镜头，下午维也纳 7 区 Neubau 文艺街区，前景是 MuseumsQuartier 红色拱形大门和庭院，' +
      '远景延伸到 Spittelberg 小巷的彩色 Biedermeier 老建筑和户外咖啡座的遮阳伞。' +
      'Anamorphic 宽屏、4K 写实、明亮午后光线、无人物特写。5 秒。',
  },
  {
    name: '09-alsergrund',
    text:
      '电影级慢推镜头，黄昏维也纳 9 区 Alsergrund，前景是 Votivkirche 沃蒂夫教堂的哥特双尖塔，' +
      '远景延伸到 AKH 老综合医院的红色屋顶和 Sigmund Freud Park 的林荫小径。' +
      'Anamorphic 宽屏、4K 写实、戏剧性暮光、无人物。5 秒。',
  },
  {
    name: '10-favoriten',
    text:
      '电影级慢推镜头，傍晚维也纳 10 区 Favoriten 新区，前景是 Wien Hauptbahnhof 总火车站的现代玻璃顶棚，' +
      '远景延伸到 Sonnwendviertel 新建白色公寓楼阵列和远处的 Wienerberg 山丘。' +
      'Anamorphic 宽屏、4K 写实、暖金色暮光、无人物。5 秒。',
  },
  {
    name: '11-simmering',
    text:
      '电影级慢平移镜头，黄昏维也纳 11 区 Simmering，前景是 Zentralfriedhof 中央公墓的古典拱形大门和林荫大道，' +
      '远景延伸到工业老厂房翻新成的现代 loft 和多瑙河南岸的烟囱剪影。' +
      'Anamorphic 宽屏、4K 写实、忧郁暮光、无人物。5 秒。',
  },
  {
    name: '12-meidling',
    text:
      '电影级慢推镜头，下午维也纳 12 区 Meidling 居住区，前景是 U6 高架地铁列车在金色阳光下经过，' +
      '远景可见 Schönbrunn 美泉宫的尖塔和密集的中产住宅区屋顶。' +
      'Anamorphic 宽屏、4K 写实、明亮自然光、无人物特写。5 秒。',
  },
  {
    name: '13-hietzing',
    text:
      '电影级低空航拍镜头，金色午后维也纳 13 区 Hietzing，前景是 Schönbrunn 美泉宫黄色巴洛克外立面和对称花园，' +
      '远景延伸到 Tiergarten 动物园的绿荫和 Gloriette 凯旋柱廊。' +
      'Anamorphic 宽屏、4K 写实、华丽金色光线、无人物。5 秒。',
  },
  {
    name: '14-penzing',
    text:
      '电影级慢平移镜头，下午维也纳 14 区 Penzing，前景是 Auhof 大型绿地公园和林荫小径，' +
      '远景延伸到 Wienerwald 维也纳森林边缘的山丘剪影和零散的别墅屋顶。' +
      'Anamorphic 宽屏、4K 写实、柔和午后光线、无人物。5 秒。',
  },
  {
    name: '15-rudolfsheim-fuenfhaus',
    text:
      '电影级慢推镜头，傍晚维也纳 15 区 Rudolfsheim-Fünfhaus，前景是 Westbahnhof 西火车站的现代玻璃外立面，' +
      '远景延伸到多元文化商业街区的灯火和有轨电车 6 路 / 9 路的轨道。' +
      'Anamorphic 宽屏、4K 写实、温暖暮光、无人物特写。5 秒。',
  },
  {
    name: '16-ottakring',
    text:
      '电影级慢平移镜头，下午维也纳 16 区 Ottakring，前景是 Brunnenmarkt 露天集市的摊位顶棚和五彩遮阳布，' +
      '远景延伸到 Gründerzeit 老公寓楼立面和 Wilhelminenberg 山丘的葡萄园边缘。' +
      'Anamorphic 宽屏、4K 写实、明亮自然光、无人物特写。5 秒。',
  },
  {
    name: '17-hernals',
    text:
      '电影级慢推镜头，黄昏维也纳 17 区 Hernals 山坡居住区，前景是斜坡上的别墅花园和红色屋顶阵列，' +
      '远景延伸到 Wienerwald 边缘的葡萄园和山顶 Heuriger 酒馆的灯火。' +
      'Anamorphic 宽屏、4K 写实、温暖暮光、无人物。5 秒。',
  },
  {
    name: '18-waehring',
    text:
      '电影级慢平移镜头，下午维也纳 18 区 Währing，前景是 Türkenschanzpark 公园的英式园林和小湖，' +
      '远景延伸到高端 Gründerzeit 公寓楼和 Vienna International School 校园的现代建筑。' +
      'Anamorphic 宽屏、4K 写实、柔和金色光线、无人物。5 秒。',
  },
  {
    name: '19-doebling',
    text:
      '电影级慢推镜头，金色傍晚维也纳 19 区 Döbling，前景是 Grinzing 葡萄园斜坡和经典葡萄藤架，' +
      '远景延伸到山坡上的独栋别墅红色屋顶和远处 Wienerwald 维也纳森林的山影。' +
      'Anamorphic 宽屏、4K 写实、奢华金色暮光、无人物。5 秒。',
  },
  {
    name: '20-brigittenau',
    text:
      '电影级低空航拍镜头，傍晚维也纳 20 区 Brigittenau，前景是 Donauinsel 多瑙岛绿色长堤和水面反光，' +
      '远景延伸到 Millennium Tower 现代摩天楼玻璃幕墙和密集的居住区屋顶。' +
      'Anamorphic 宽屏、4K 写实、暖橘色暮光、无人物。5 秒。',
  },
  {
    name: '21-floridsdorf',
    text:
      '电影级低空航拍镜头，金色午后维也纳 21 区 Floridsdorf 北部新城，前景是大片新建的白色低层公寓楼和绿地，' +
      '远景延伸到 Bisamberg 山丘的葡萄园斜坡和 U6 北端的现代地铁桥。' +
      'Anamorphic 宽屏、4K 写实、明亮自然光、无人物。5 秒。',
  },
  {
    name: '22-donaustadt',
    text:
      '电影级航拍俯瞰镜头，黄昏金色阳光下的维也纳 22 区 Donaustadt 现代城区，' +
      '远景可见多瑙河蜿蜒、DC Tower 玻璃幕墙摩天楼群、新建白色公寓楼阵列、' +
      '宽阔林荫大道、Hirschstetten 湖区水面反光、远处 Kaisermühlen U-Bahn 桥梁。' +
      '镜头缓慢前推穿过城区天际线，云层缓动，阳光斜射建筑外立面。' +
      'Anamorphic 宽屏 16:9、4K 写实、温暖金色暮光、无人物特写、无字幕。5 秒。',
  },
  {
    name: '23-liesing',
    text:
      '电影级慢推镜头，下午维也纳 23 区 Liesing 南郊别墅区，前景是大片独栋别墅花园和红色屋顶阵列，' +
      '远景延伸到 Wienerwald 维也纳森林边缘的山坡和 Lainzer Tiergarten 自然保护区的密林。' +
      'Anamorphic 宽屏、4K 写实、柔和午后光线、无人物。5 秒。',
  },
];

async function submitTask(prompt) {
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: MODEL, content: [{ type: 'text', text: prompt }] }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`Submit ${r.status}: ${JSON.stringify(data).slice(0,300)}`);
  return data.id || data.task_id;
}

async function pollTask(taskId) {
  let last = '';
  for (let i = 0; i < 60; i++) {
    const r = await fetch(`${ENDPOINT}/${taskId}`, { headers: { Authorization: `Bearer ${KEY}` } });
    const data = await r.json();
    const status = data.status || data.task_status;
    if (status !== last) { process.stdout.write(` ${status}`); last = status; } else process.stdout.write('.');
    if (['succeeded','success','SUCCEEDED'].includes(status)) {
      const url = data.content?.video_url || data.content?.[0]?.video_url || data.output?.video_url || data.video_url;
      if (!url) throw new Error('no video URL');
      console.log(' ✓');
      return url;
    }
    if (['failed','FAILED','error'].includes(status)) throw new Error('task failed');
    await sleep(10000);
  }
  throw new Error('timeout');
}

async function download(url, dest) {
  const r = await fetch(url);
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const c of CLIPS) {
    const dest = path.join(OUT_DIR, `${c.name}.mp4`);
    if (fs.existsSync(dest)) { console.log(`[skip] ${dest}`); continue; }
    console.log(`\n[${c.name}] submitting…`);
    try {
      const id = await submitTask(c.text);
      console.log(`  task ${id}, polling…`);
      const url = await pollTask(id);
      const size = await download(url, dest);
      console.log(`  ✓ ${dest} (${(size/1024/1024).toFixed(1)} MB)`);
    } catch (e) {
      console.error(`  ✗ ${c.name} failed:`, e.message);
    }
  }
  console.log('\nDone.');
}

main().catch(e => { console.error(e); process.exit(1); });
