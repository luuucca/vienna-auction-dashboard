/**
 * generate-ambient-videos.mjs
 * Generates additional ambient clips for /about and the homepage
 * contact section, so each can rotate through 3 videos instead of
 * playing the same one on loop.
 *
 * Run:
 *   set VOLCENGINE_ARK_KEY=ark-xxxxxxx
 *   node scripts/generate-ambient-videos.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.VOLCENGINE_ARK_KEY;
if (!KEY) { console.error('VOLCENGINE_ARK_KEY missing'); process.exit(1); }

const ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks';
const MODEL    = 'doubao-seedance-2-0-260128';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const CLIPS = [
  // ── About page: warm meet-up vibe ─────────────────────────────────
  {
    dir: 'public/about',
    name: 'street-twilight',
    text:
      '电影级慢推镜头，维也纳老城鹅卵石小街傍晚景象，' +
      '街边古典店面灯火渐次亮起，暖橘色橱窗光洒在湿润的石板路上。' +
      '远景偶尔有行人剪影缓慢经过（背对镜头），近处店牌的字体细节清晰。' +
      'Anamorphic 宽屏、浅景深、4K 写实、温暖色调、无人物特写。5 秒。',
  },
  {
    dir: 'public/about',
    name: 'stadtpark-autumn',
    text:
      '电影级慢平移镜头，维也纳 Stadtpark 公园秋日午后场景，' +
      '金黄秋叶在阳光下飘落，远处可见 Johann Strauss 镀金雕像隐约轮廓。' +
      '镜头沿林荫小径横移，地面落叶随轻风缓慢翻动。' +
      'Anamorphic 宽屏、浅景深、4K 写实、金色秋光、无人物。5 秒。',
  },
  // ── Homepage contact section: new home / hopeful vibe ─────────────
  {
    dir: 'public/contact',
    name: 'kitchen-dawn',
    text:
      '电影级慢推镜头，维也纳现代公寓厨房清晨场景，' +
      '柔和金色阳光从大窗斜射进来，照在大理石台面、铜壶和切好的水果上。' +
      '远处可见一杯热咖啡升起的蒸汽，桌上摆着房屋钥匙圈。' +
      'Anamorphic 宽屏、浅景深、4K 写实、温暖色调、无人物、无字幕。5 秒。',
  },
  {
    dir: 'public/contact',
    name: 'plant-window',
    text:
      '电影级慢推镜头，维也纳老式公寓客厅窗台特写，' +
      '一盆生机盎然的绿植放在窗边，柔和清晨阳光从大窗洒入，' +
      '远处隐约可见维也纳屋顶天际线和教堂尖塔。' +
      '镜头缓慢前推，叶子在轻风中微微颤动。' +
      'Anamorphic 宽屏、浅景深、4K 写实、温暖色调、无人物。5 秒。',
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
      const url = data.content?.video_url || data.content?.[0]?.video_url
        || data.output?.video_url || data.video_url;
      if (!url) throw new Error('no video URL: ' + JSON.stringify(data).slice(0,300));
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
  for (const c of CLIPS) {
    if (!fs.existsSync(c.dir)) fs.mkdirSync(c.dir, { recursive: true });
    const dest = path.join(c.dir, `${c.name}.mp4`);
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
