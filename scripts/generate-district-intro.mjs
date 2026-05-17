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

const CLIPS = [
  // 22. Donaustadt — most populous + modern district, glass towers,
  // Danube riverfront, fresh suburban housing
  {
    name: '22-donaustadt',
    text:
      '电影级航拍俯瞰镜头，黄昏金色阳光下的维也纳 22 区 Donaustadt 现代城区，' +
      '远景可见多瑙河蜿蜒、DC Tower 玻璃幕墙摩天楼群、新建白色公寓楼阵列、' +
      '宽阔林荫大道、Hirschstetten 湖区水面反光、远处 Kaisermühlen U-Bahn 桥梁。' +
      '镜头缓慢前推穿过城区天际线，云层缓动，阳光斜射建筑外立面。' +
      'Anamorphic 宽屏 16:9、4K 写实、温暖金色暮光、无人物特写、无字幕。5 秒。',
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
