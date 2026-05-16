/**
 * generate-hero-i2v.mjs
 *
 * Image-to-video: takes a still photo + prompt and animates it via
 * Doubao-Seedance-2.0. Used to extend the hero rotation with clips
 * keyed off specific Vienna landmarks the user picked.
 *
 * Source images must already exist on disk at the paths declared in
 * the SOURCES array. The script base64-encodes each image inline so
 * the API can ingest it without us having to publicly host the file.
 *
 * Run:
 *   set VOLCENGINE_ARK_KEY=ark-xxxxxxx
 *   node scripts/generate-hero-i2v.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.VOLCENGINE_ARK_KEY;
if (!KEY) {
  console.error('Please set VOLCENGINE_ARK_KEY environment variable.');
  process.exit(1);
}

const ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks';
const MODEL    = 'doubao-seedance-2-0-260128';
const OUT_DIR  = 'public/hero';

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Each entry pairs a source still with the camera-move prompt that
   should animate it. Keep prompts in the same style as text-to-video:
   concrete camera language, lighting cue, "no people / no text",
   duration hint at the end. */
const SOURCES = [
  {
    name: '05-votivkirche-night',
    src:  'public/hero-source/05-votivkirche-night.png',
    text:
      '电影级慢速垂直摇镜，从教堂正门基座缓慢上仰至双尖塔的全貌，' +
      '保持画面中央哥特双塔的发光光环细节清晰。' +
      '深夜墨蓝天空、暖金色教堂泛光、远处城市灯火静止微闪。' +
      'Anamorphic 宽屏、4K 写实、浅景深、无人物、无字幕。5 秒。',
  },
  {
    name: '06-hofburg-sunset',
    src:  'public/hero-source/06-hofburg-sunset.png',
    text:
      '电影级慢推镜头，沿街道缓慢向前推进，对准远处 Hofburg 绿色穹顶。' +
      '黄昏天空云层缓动、橘金色光线渐变、街边橱窗灯光温暖。' +
      '行人保持静止或极缓慢自然移动（避免快走、避免奇怪姿态）。' +
      'Anamorphic 宽屏、4K 写实、浅景深、电影色彩分级。5 秒。',
  },
];

// ── Build data URL from local image ──────────────────────────────────
function imgToDataUrl(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

async function submitTask(prompt, imgDataUrl) {
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imgDataUrl } },
      ],
    }),
  });
  const data = await r.json();
  if (!r.ok) {
    throw new Error(`Submit failed (${r.status}): ${JSON.stringify(data).slice(0, 500)}`);
  }
  return data.id || data.task_id || data.data?.id;
}

async function pollTask(taskId) {
  const url = `${ENDPOINT}/${taskId}`;
  let lastStatus = '';
  for (let i = 0; i < 60; i++) {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${KEY}` } });
    const data = await r.json();
    const status = data.status || data.task_status || data.state;
    if (status !== lastStatus) {
      process.stdout.write(`  status: ${status} `);
      lastStatus = status;
    } else {
      process.stdout.write('.');
    }
    if (['succeeded', 'success', 'SUCCEEDED'].includes(status)) {
      console.log(' ✓');
      const videoUrl =
        data.content?.video_url
        || data.content?.[0]?.video_url
        || data.output?.video_url
        || data.output?.[0]?.video_url
        || data.result?.video_url
        || data.video_url;
      if (!videoUrl) {
        console.log('  Full response:', JSON.stringify(data, null, 2));
        throw new Error('Could not find video URL in response');
      }
      return videoUrl;
    }
    if (['failed', 'FAILED', 'error'].includes(status)) {
      console.log(' ✗');
      throw new Error(`Task failed: ${JSON.stringify(data).slice(0, 500)}`);
    }
    await sleep(10000);
  }
  throw new Error('Timed out');
}

async function download(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Download failed ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const s of SOURCES) {
    const dest = path.join(OUT_DIR, `${s.name}.mp4`);
    if (fs.existsSync(dest)) {
      console.log(`[skip] ${s.name}.mp4 already exists`);
      continue;
    }
    if (!fs.existsSync(s.src)) {
      console.error(`[skip] source missing: ${s.src}`);
      continue;
    }
    console.log(`\n[${s.name}] submitting (I2V from ${s.src})…`);
    try {
      const dataUrl = imgToDataUrl(s.src);
      console.log(`  source size: ${(dataUrl.length / 1024).toFixed(0)} KB (base64)`);
      const taskId = await submitTask(s.text, dataUrl);
      console.log(`  task id: ${taskId}`);
      const videoUrl = await pollTask(taskId);
      console.log(`  downloading…`);
      const size = await download(videoUrl, dest);
      console.log(`  ✓ wrote ${dest} (${(size / 1024 / 1024).toFixed(1)} MB)`);
    } catch (e) {
      console.error(`  ✗ ${s.name} failed:`, e.message);
    }
  }

  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.mp4'));
  console.log(`\n===== Done: ${files.length} total clips in ${OUT_DIR} =====`);
}

main().catch(e => { console.error(e); process.exit(1); });
