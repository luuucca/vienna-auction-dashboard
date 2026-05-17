/**
 * generate-lucky-cat.mjs
 * One gold lucky-cat (招财猫) clip for the homepage contact rotation.
 *
 * Run:
 *   set VOLCENGINE_ARK_KEY=ark-xxxxxxx
 *   node scripts/generate-lucky-cat.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.VOLCENGINE_ARK_KEY;
if (!KEY) { console.error('VOLCENGINE_ARK_KEY missing'); process.exit(1); }

const ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks';
const MODEL    = 'doubao-seedance-2-0-260128';
const OUT_DIR  = 'public/contact';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const CLIP = {
  name: 'lucky-cat-gold',
  text:
    '电影级近景特写，一只通体金色的传统招财猫陶瓷摆件居中放置在木桌上，' +
    '右前爪缓慢上下挥动招手动作（持续重复），脖子上挂着红色绸带与铃铛。' +
    '背景是温暖的虚化室内场景，柔和金色阳光从右侧斜射进来。' +
    'Anamorphic 宽屏、浅景深、4K 写实、温暖色调、安静氛围、无人物。5 秒。',
};

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
    if (['failed','FAILED','error'].includes(status)) throw new Error('failed');
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
  const dest = path.join(OUT_DIR, `${CLIP.name}.mp4`);
  if (fs.existsSync(dest)) { console.log(`[skip] ${dest}`); return; }
  console.log(`\n[${CLIP.name}] submitting…`);
  const id = await submitTask(CLIP.text);
  console.log(`  task ${id}, polling…`);
  const url = await pollTask(id);
  const size = await download(url, dest);
  console.log(`  ✓ ${dest} (${(size/1024/1024).toFixed(1)} MB)`);
}

main().catch(e => { console.error(e); process.exit(1); });
