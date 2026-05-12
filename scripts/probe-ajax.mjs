/**
 * probe-ajax.mjs - 探测 Ediktsdatei AJAX 请求，找到真实数据端点
 * 运行: node scripts/probe-ajax.mjs
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function probe() {
  console.log('启动浏览器，拦截所有网络请求...');
  const browser = await chromium.launch({ headless: false }); // 非无头，方便观察
  const context = await browser.newContext({ locale: 'de-AT' });
  const page = await context.newPage();

  // 拦截并记录所有请求和响应
  const allRequests = [];
  page.on('request', req => {
    allRequests.push({ type: 'REQUEST', method: req.method(), url: req.url(), time: Date.now() });
  });
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('edikte') || url.includes('justiz')) {
      let body = '';
      try {
        body = (await res.text()).substring(0, 500);
      } catch {}
      allRequests.push({
        type: 'RESPONSE',
        status: res.status(),
        url,
        bodyPreview: body,
        time: Date.now()
      });
    }
  });

  // 访问搜索页并执行 Wien 搜索
  console.log('打开搜索页...');
  await page.goto('https://edikte.justiz.gv.at/edikte/ex/exedi3.nsf/suche!OpenForm&subf=ex',
    { waitUntil: 'networkidle', timeout: 30000 });

  console.log('选择 Wien...');
  await page.selectOption('select[name="BL"]', '0');
  await page.waitForTimeout(500);

  console.log('点击搜索...');
  await page.click('input[name="sebut"]');

  console.log('等待结果和AJAX（30秒）...');
  await page.waitForTimeout(30000); // 给足够时间让所有 AJAX 完成

  // 检查 divedikt 内容
  const divedikt = await page.evaluate(() => document.getElementById('divedikt')?.innerHTML || '');
  console.log(`divedikt length: ${divedikt.length}`);
  console.log('divedikt preview:', divedikt.substring(0, 500));

  // 保存所有网络请求日志
  const logPath = join(__dirname, 'network-log.json');
  writeFileSync(logPath, JSON.stringify(allRequests, null, 2), 'utf8');
  console.log(`\n网络请求日志已保存到 ${logPath}`);
  console.log(`共 ${allRequests.length} 条请求记录`);

  // 打印所有 edikte 相关请求
  console.log('\n=== 所有 Ediktsdatei 请求 ===');
  allRequests.filter(r => r.url?.includes('edikte') && r.type === 'REQUEST').forEach(r => {
    console.log(`  ${r.method} ${r.url}`);
  });

  // 保存完整页面 HTML
  const finalHtml = await page.content();
  writeFileSync(join(__dirname, 'debug_results2.html'), finalHtml, 'utf8');

  await browser.close();
}

probe().catch(e => { console.error(e); process.exit(1); });
