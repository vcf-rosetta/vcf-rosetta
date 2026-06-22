// 本地 E2E 测试插件 UI(用系统 Chrome,无需 vCenter)。
// 起静态服务托管 dist/ 的插件包内容,用 Playwright 真实点击/输入/断言 + 截图。
//   node tests/ui.test.mjs
import { chromium } from 'playwright';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', 'dist', '_uitest');
const PORT = 9300;
const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json' };

const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/') p = '/index.html';
    const body = await readFile(join(ROOT, p));
    res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('404'); }
});

let pass = 0, fail = 0;
function check(name, cond) { (cond ? pass++ : fail++); console.log((cond ? '  ✓ ' : '  ✗ ') + name); }

await new Promise(r => server.listen(PORT, r));
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1100, height: 760 } });
const consoleErrors = [];
page.on('pageerror', e => consoleErrors.push(String(e)));

try {
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });

  // 标题 + 4 个标签
  check('标题为中文运维助手', (await page.textContent('h1')).includes('中文运维助手'));
  const tabs = await page.$$eval('.tab', els => els.map(e => e.textContent));
  check('四个标签齐全', ['资产总览', '最近任务', '告警解释', '术语查询'].every(t => tabs.includes(t)));

  // 资产总览:无 vCenter 应优雅降级
  await page.click('.tab[data-tab="overview"]');
  await page.waitForTimeout(800);
  const note = await page.textContent('#overview-note');
  check('资产总览优雅降级提示', /未能获取实时数据|实时/.test(note));

  // 告警解释:渲染 + 搜索 + 展开
  await page.click('.tab[data-tab="alarms"]');
  const cardCount = await page.$$eval('#alarm-list .card', c => c.length);
  check('告警卡片已渲染(18)', cardCount === 18);
  await page.fill('#alarm-search', '主机');
  await page.waitForTimeout(200);
  const filtered = await page.$$eval('#alarm-list .card', c => c.length);
  check('搜索"主机"过滤生效', filtered > 0 && filtered < 18);
  await page.click('#alarm-list .card .card-head');
  check('点击展开显示建议处置', (await page.textContent('#alarm-list .card.open .card-body')).includes('建议处置'));

  // 术语查询:搜索
  await page.click('.tab[data-tab="glossary"]');
  await page.fill('#glossary-search', 'Datastore');
  await page.waitForTimeout(200);
  const rows = await page.$$eval('#glossary-rows tr', r => r.length);
  const firstZh = await page.textContent('#glossary-rows tr td.zh');
  check('术语查询有结果', rows > 0);
  check('Datastore -> 数据存储', firstZh && firstZh.includes('数据存储'));

  // 无 JS 运行时错误
  check('无页面 JS 错误', consoleErrors.length === 0);
  if (consoleErrors.length) console.log('    ', consoleErrors.join('\n    '));

  // 截图(每个标签)
  for (const t of ['overview', 'tasks', 'alarms', 'glossary']) {
    await page.click(`.tab[data-tab="${t}"]`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(here, `shot-${t}.png`) });
  }
  console.log('  截图已存:tests/shot-*.png');
} catch (e) {
  fail++; console.log('  ✗ 异常:', e.message);
} finally {
  await browser.close();
  server.close();
}

console.log(`\n结果:${pass} 通过 / ${fail} 失败`);
process.exit(fail ? 1 : 0);
