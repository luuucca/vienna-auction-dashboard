/**
 * generate-hero-videos.mjs
 *
 * One-time script: drives Volcengine Ark's Doubao-Seedance-2.0 to
 * produce ~8s cinematic Vienna clips for the homepage hero, then
 * downloads them to public/hero/*.mp4.
 *
 * Run:
 *   set VOLCENGINE_ARK_KEY=ark-xxxxxxx
 *   node scripts/generate-hero-videos.mjs
 *
 * Cost (mid-2026):  ~¥10-30 per video × 4 = ~¥40-120 total.
 * Time: ~60-120s per video. Whole batch ~5-10 minutes.
 *
 * Re-running: skips any clip whose .mp4 already exists. Delete the
 * file first to force regenerate that one prompt.
 */
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.VOLCENGINE_ARK_KEY;
if (!KEY) {
  console.error('Please set VOLCENGINE_ARK_KEY environment variable.');
  console.error('Get the key from https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey');
  process.exit(1);
}

const ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks';
const MODEL    = 'doubao-seedance-2-0-260128';
const OUT_DIR  = 'public/hero';

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Prompts ────────────────────────────────────────────────────────
// Each prompt is engineered for an 8-10s clip, cinematic slow motion,
// matches the dark/gold editorial luxury aesthetic of the site.
// Tweak the text and re-run to regenerate.
const PROMPTS = [
  {
    name: '01-stephansdom-dusk',
    text:
      '电影级慢推镜头，黄昏时分维也纳 Stephansdom 大教堂哥特尖顶逆光剪影，' +
      '远景拉至老城屋顶天际线。橘色暮光、深蓝天空、城市灯火渐次亮起。' +
      'Anamorphic 宽银幕、浅景深、慢动作、4K 写实。' +
      '色调金色与深邃黑色，奢华编辑风格。无人物。8 秒。',
  },
  {
    name: '02-belvedere-golden',
    text:
      '电影级航拍俯视镜头，秋日金色傍晚的维也纳 Belvedere 美景宫与几何花园，' +
      '镜头缓慢前推穿过对称式法式园林，巴洛克宫殿建筑细节渐近。' +
      '金色秋叶、长影、薄雾、教堂尖塔远景。' +
      '电影感、写实质感、奢华编辑风格。无人物。8 秒。',
  },
  {
    name: '03-ringstrasse-night',
    text:
      '电影级低角度跟拍镜头，维也纳 Ringstrasse 环城大道夜景，' +
      '雨后湿润的石板路反射橘色街灯，古典歌剧院与博物馆建筑剪影侧掠而过。' +
      '镜头随车流缓慢平移，慢门拖尾光迹。' +
      '深蓝夜空、暖金色灯光对比、电影级色彩分级、4K 写实。无人物。8 秒。',
  },
  {
    name: '04-donaukanal-twilight',
    text:
      '电影级俯视航拍镜头，蓝色时刻的维也纳 Donaukanal 多瑙运河水岸，' +
      '镜头沿水面平移，倒影中老城灯火与现代玻璃楼宇交错。' +
      '冷蓝夜色与暖橘灯光对比，云层缓动，水面微波。' +
      'Anamorphic 宽屏、慢动作、4K 写实。无人物。8 秒。',
  },
];

// ── Submit a task: returns task id ──────────────────────────────────
async function submitTask(prompt) {
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      content: [{ type: 'text', text: prompt }],
    }),
  });
  const data = await r.json();
  if (!r.ok) {
    throw new Error(`Submit failed (${r.status}): ${JSON.stringify(data)}`);
  }
  // The Ark API returns the task id as `id` at top level.
  return data.id || data.task_id || data.data?.id;
}

// ── Poll task status until succeeded / failed ───────────────────────
async function pollTask(taskId) {
  const url = `${ENDPOINT}/${taskId}`;
  let lastStatus = '';
  for (let i = 0; i < 60; i++) { // up to ~10min at 10s interval
    const r = await fetch(url, { headers: { Authorization: `Bearer ${KEY}` } });
    const data = await r.json();
    const status = data.status || data.task_status || data.state;
    if (status !== lastStatus) {
      process.stdout.write(`  status: ${status} `);
      lastStatus = status;
    } else {
      process.stdout.write('.');
    }
    if (status === 'succeeded' || status === 'success' || status === 'SUCCEEDED') {
      console.log(' ✓');
      // Extract video URL — Ark may return it as `content[].video_url`
      // OR `content.video_url` OR `output.video_url`.
      const videoUrl =
        data.content?.video_url
        || data.content?.[0]?.video_url
        || data.output?.video_url
        || data.output?.[0]?.video_url
        || data.result?.video_url
        || data.video_url;
      if (!videoUrl) {
        console.log('  Full response (please check shape):', JSON.stringify(data, null, 2));
        throw new Error('Could not find video URL in response');
      }
      return videoUrl;
    }
    if (status === 'failed' || status === 'FAILED' || status === 'error') {
      console.log(' ✗');
      throw new Error(`Task failed: ${JSON.stringify(data)}`);
    }
    await sleep(10000);
  }
  throw new Error('Timed out after 10 minutes');
}

// ── Download mp4 to disk ────────────────────────────────────────────
async function download(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Download failed ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return buf.length;
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const p of PROMPTS) {
    const dest = path.join(OUT_DIR, `${p.name}.mp4`);
    if (fs.existsSync(dest)) {
      console.log(`[skip] ${p.name}.mp4 already exists`);
      continue;
    }
    console.log(`\n[${p.name}] submitting…`);
    try {
      const taskId = await submitTask(p.text);
      console.log(`  task id: ${taskId}`);
      const videoUrl = await pollTask(taskId);
      console.log(`  downloading ${videoUrl.slice(0, 80)}…`);
      const size = await download(videoUrl, dest);
      console.log(`  ✓ wrote ${dest} (${(size / 1024 / 1024).toFixed(1)} MB)`);
    } catch (e) {
      console.error(`  ✗ ${p.name} failed:`, e.message);
    }
  }

  // Report total
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.mp4'));
  const totalMB = files.reduce(
    (sum, f) => sum + fs.statSync(path.join(OUT_DIR, f)).size,
    0,
  ) / 1024 / 1024;
  console.log(`\n===== Done: ${files.length} clips, ${totalMB.toFixed(1)} MB total =====`);
}

main().catch(e => { console.error(e); process.exit(1); });
