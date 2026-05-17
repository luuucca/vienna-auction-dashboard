/**
 * generate-contact-video.mjs
 * One ambient clip for the homepage's "开始您的置业之旅" contact
 * section. Theme: warm, hopeful, "next chapter starts here".
 *
 * Run:
 *   set VOLCENGINE_ARK_KEY=ark-xxxxxxx
 *   node scripts/generate-contact-video.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.VOLCENGINE_ARK_KEY;
if (!KEY) { console.error('VOLCENGINE_ARK_KEY missing'); process.exit(1); }

const ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks';
const MODEL    = 'doubao-seedance-2-0-260128';
const OUT_DIR  = 'public/contact';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const CLIPS = [
  {
    name: 'apartment-keys',
    text:
      '电影级慢推镜头，维也纳老城公寓室内场景，' +
      '清晨柔和金色阳光从大窗洒入空荡的客厅，' +
      '镜头缓慢前推，地板的木纹细节清晰，远处可见挂在玄关墙的钥匙串轻轻晃动。' +
      '空间整洁、阳光斜射、灰尘微粒在光束中漂浮。' +
      'Anamorphic 宽屏、浅景深、4K 写实、温暖色调、无人物、无字幕。5 秒。',
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
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const c of CLIPS) {
    const dest = path.join(OUT_DIR, `${c.name}.mp4`);
    if (fs.existsSync(dest)) { console.log(`[skip] ${dest}`); continue; }
    console.log(`\n[${c.name}] submitting…`);
    const id = await submitTask(c.text);
    console.log(`  task ${id}, polling…`);
    const url = await pollTask(id);
    const size = await download(url, dest);
    console.log(`  ✓ ${dest} (${(size/1024/1024).toFixed(1)} MB)`);
  }
  console.log('\nDone.');
}

main().catch(e => { console.error(e); process.exit(1); });
