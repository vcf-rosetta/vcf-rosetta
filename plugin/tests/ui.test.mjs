// 本地 E2E 测试插件 UI(用系统 Chrome,无需 vCenter)。双语 + 各功能。
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
const errs = [];
page.on('pageerror', e => errs.push(String(e)));

try {
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('#alarm-list .card'));

  // 默认中文
  check('默认中文标题', (await page.textContent('#title')).includes('中文运维助手'));
  const zhTabs = await page.$$eval('.tab', els => els.map(e => e.textContent));
  check('中文标签', ['资产总览', '最近任务', '告警解释', '术语查询'].every(x => zhTabs.includes(x)));
  await page.click('.tab[data-tab="alarms"]');
  check('中文告警卡片(18)', (await page.$$eval('#alarm-list .card', c => c.length)) === 18);
  check('中文告警名', (await page.textContent('#alarm-list .card .card-title')).includes('主机连接'));

  // 术语查询
  await page.click('.tab[data-tab="glossary"]');
  await page.fill('#glossary-search', 'Datastore');
  await page.waitForTimeout(250);
  check('zh: Datastore -> 数据存储', (await page.textContent('#glossary-rows td.zh')).includes('数据存储'));

  // 切换德文
  await page.selectOption('#lang', 'de');
  await page.waitForFunction(() => document.querySelector('#title').textContent.includes('Betriebsassistent'));
  const deTabs = await page.$$eval('.tab', els => els.map(e => e.textContent));
  check('德文标签', ['Bestandsübersicht', 'Alarmerklärung', 'Begriffssuche'].every(x => deTabs.includes(x)));
  await page.click('.tab[data-tab="alarms"]');
  await page.waitForFunction(() => document.querySelector('#alarm-list .card'));
  check('德文告警名', /Hostverbindung|Datenspeicher|CPU/.test(await page.textContent('#alarm-list .card .card-title')));
  await page.click('.tab[data-tab="glossary"]');
  await page.fill('#glossary-search', 'Datastore');
  await page.waitForTimeout(250);
  check('de: Datastore -> Datenspeicher', (await page.textContent('#glossary-rows td.zh')).includes('Datenspeicher'));

  check('无页面 JS 错误', errs.length === 0);
  if (errs.length) console.log('    ', errs.join('\n    '));

  await page.selectOption('#lang', 'zh-CN');
  await page.waitForTimeout(300);
  for (const tb of ['overview', 'alarms', 'glossary']) { await page.click(`.tab[data-tab="${tb}"]`); await page.waitForTimeout(200); await page.screenshot({ path: join(here, `shot-${tb}.png`) }); }
} catch (e) {
  fail++; console.log('  ✗ 异常:', e.message);
} finally {
  await browser.close();
  server.close();
}
console.log(`\n结果:${pass} 通过 / ${fail} 失败`);
process.exit(fail ? 1 : 0);
