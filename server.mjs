/**
 * server.mjs — 轻量 API 服务器
 * 提供 /api/refresh 接口，触发数据抓取脚本
 * 运行：node server.mjs
 */

import http from 'http';
import { spawn } from 'child_process';
import { readFileSync, existsSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3099;
const AUCTIONS_PATH = join(__dirname, 'public', 'data', 'auctions.json');
const SCRAPER_PATH = join(__dirname, 'scripts', 'fetch-auctions.mjs');

// 防止并发抓取
let scraperRunning = false;
let scraperStartTime = null;
let scraperLog = [];
const MAX_LOG = 200;

// SSE 订阅者列表
const subscribers = new Set();

function broadcast(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of subscribers) {
    try { res.write(msg); } catch {}
  }
}

function getFileInfo() {
  if (!existsSync(AUCTIONS_PATH)) return { count: 0, lastModified: null };
  try {
    const data = JSON.parse(readFileSync(AUCTIONS_PATH, 'utf8'));
    const mtime = statSync(AUCTIONS_PATH).mtimeMs;
    return { count: data.length, lastModified: new Date(mtime).toISOString() };
  } catch {
    return { count: 0, lastModified: null };
  }
}

function runScraper() {
  if (scraperRunning) return { started: false, reason: '抓取任务已在运行中' };

  scraperRunning = true;
  scraperStartTime = Date.now();
  scraperLog = [];

  broadcast({ type: 'start', time: scraperStartTime });

  const child = spawn(process.execPath, [SCRAPER_PATH], {
    cwd: __dirname,
    env: process.env,
  });

  child.stdout.on('data', (buf) => {
    for (const line of buf.toString().split('\n').filter(Boolean)) {
      scraperLog.push(line);
      if (scraperLog.length > MAX_LOG) scraperLog.shift();
      broadcast({ type: 'log', line });
    }
  });

  child.stderr.on('data', (buf) => {
    const line = buf.toString().trim();
    if (line) {
      scraperLog.push(line);
      broadcast({ type: 'log', line });
    }
  });

  child.on('close', (code) => {
    scraperRunning = false;
    const elapsed = ((Date.now() - scraperStartTime) / 1000).toFixed(1);
    broadcast({ type: 'done', code, elapsed, ...getFileInfo() });
    console.log(`[scraper] 完成 exit=${code} 耗时${elapsed}s`);
  });

  return { started: true };
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);

  // GET /api/status
  if (pathname === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      running: scraperRunning,
      startTime: scraperStartTime,
      log: scraperLog.slice(-20),
      ...getFileInfo(),
    }));
    return;
  }

  // POST /api/refresh — 触发抓取
  if (pathname === '/api/refresh' && req.method === 'POST') {
    const result = runScraper();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // GET /api/events — SSE 实时进度
  if (pathname === '/api/events' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write(`data: ${JSON.stringify({ type: 'connected', running: scraperRunning })}\n\n`);
    if (scraperRunning) {
      for (const line of scraperLog.slice(-50)) {
        res.write(`data: ${JSON.stringify({ type: 'log', line })}\n\n`);
      }
    }
    subscribers.add(res);
    req.on('close', () => subscribers.delete(res));
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`[API] http://localhost:${PORT}`);
});
