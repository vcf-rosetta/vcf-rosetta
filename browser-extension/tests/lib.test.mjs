// content/lib.js 纯函数单测(node --test,零依赖)。
// 覆盖:词典清洗 / 归一化 / 采集过滤 / PHRASES 受控替换与自动预筛划分。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const L = require('../content/lib.js');

// ── sanitizeDict ──────────────────────────────────────────
test('sanitizeDict: 只保留字符串值,落到无原型对象', () => {
  const d = L.sanitizeDict({ Hello: '你好', _note: '备注也是字符串,保留', n: 42, o: {}, a: [] });
  assert.equal(d.Hello, '你好');
  assert.equal(d._note, '备注也是字符串,保留');
  assert.equal(d.n, undefined);
  assert.equal(d.o, undefined);
  assert.equal(Object.getPrototypeOf(d), null);        // 原型污染防线
  assert.equal(d.constructor, undefined);              // "constructor" 页面文本不得命中继承属性
  assert.equal(d.toString, undefined);
});

test('sanitizeDict: 非法输入返回 null', () => {
  assert.equal(L.sanitizeDict(null), null);
  assert.equal(L.sanitizeDict('str'), null);
  assert.equal(L.sanitizeDict([1, 2]), null);
  assert.equal(L.sanitizeDict({}), null);              // 全空
  assert.equal(L.sanitizeDict({ a: 1 }), null);        // 无任何字符串值
});

// ── normTerm / buildAux ───────────────────────────────────
test('normTerm: 大小写 / 尾部标点 / 多空白归一', () => {
  assert.equal(L.normTerm('CPU Usage:'), 'cpu usage');
  assert.equal(L.normTerm('CPU  Usage…'), 'cpu usage');
  assert.equal(L.normTerm('CPU Usage...'), 'cpu usage');
  assert.equal(L.normTerm('CPU Usage:'), 'cpu usage'); // 全角冒号
  assert.equal(L.normTerm('  Memory  '), 'memory');
});

test('buildAux: 归一形冲突取更短键(裸形优先)', () => {
  const aux = L.buildAux({ 'CPU Usage:': 'x', 'CPU Usage': 'y' });
  assert.equal(aux['cpu usage'], 'CPU Usage');
});

// ── looksTranslatable(采集过滤)──────────────────────────
test('looksTranslatable: 值得翻译的 UI 文本放行', () => {
  for (const s of [
    'Storage Adapters',
    'Power Management',
    'The selected hosts will be placed in maintenance mode.',
    // 长描述不设上限(旧 120 上限曾整段丢弃)
    'When you create a vSAN cluster, the wizard guides you through the process of configuring the cluster. '.repeat(3),
  ]) assert.equal(L.looksTranslatable(s), true, s);
});

test('looksTranslatable: 动态值/机器标识/噪声剔除', () => {
  for (const s of [
    '05/03/2026', '11:42:09 PM', '00:50:56:aa:bb:cc',      // 日期/时钟/MAC
    '0 MB', '267 GHz free',                                 // 数值±单位
    'com.vmware.cns', 'fleet-ops.knight.com', 'vc01.local:443', // 标识符/FQDN
    'snake_case_token', 'CisTaskProgress',                  // snake/驼峰
    'api/v1/{id}/tasks', 'urn:vmomi:HostSystem',            // 路径/URN
    '6f9619ff-8b86-d011-b42d-00c04fc964ff',                 // GUID
    'undefined', 'null', 'NaN', 'mmMwWLliI0O&1',            // 渲染缺陷/字体探针
    'fe80::250:56ff:feaa:bbcc', 'VSPHERE.LOCAL\\Administrator', // IPv6/域主体
    'Administrator@VSPHERE.LOCAL', 'lic...', 'Jun 20',      // UPN/截断/月日
    'knight-md-cl01', '已经是中文', 'A', '42%',
  ]) assert.equal(L.looksTranslatable(s), false, s);
});

// ── classifyFlags ─────────────────────────────────────────
test('classifyFlags: 标记维度', () => {
  assert.ok(L.classifyFlags('3 hosts remaining').includes('含数字·疑动态'));
  assert.ok(L.classifyFlags('x'.repeat(61)).includes('长句'));
  assert.ok(L.classifyFlags('lowercase fragment').includes('疑片段'));
  assert.ok(L.classifyFlags('ALL CAPS LABEL').includes('全大写'));
  assert.ok(L.classifyFlags('value ${x} here').includes('疑占位/异常'));
  assert.ok(L.classifyFlags('see com.vmware.vapi.std docs').includes('疑标识符'));
  assert.deepEqual(L.classifyFlags('Normal sentence here'), []);
});

// ── PHRASES:结构不变量 ───────────────────────────────────
const groupCount = re => new RegExp(re.source + '|').exec('').length - 1;

test('PHRASES: 每个译文引用的 $N 不超过模式的捕获组数', () => {
  for (const [re, table] of L.PHRASES) {
    const n = groupCount(re);
    for (const [lang, rep] of Object.entries(table)) {
      for (const m of rep.matchAll(/\$(\d)/g)) {
        assert.ok(+m[1] >= 1 && +m[1] <= n,
          `${re} [${lang}] 引用 $${m[1]},但只有 ${n} 个捕获组`);
      }
    }
  }
});

test('PHRASES: 预筛自动划分 —— 要求数字的模式源码必含 \\d 或字面数字', () => {
  // 回归锁:历史上手工登记表漏登无数字模式("task running on target ... SUCCESS"),
  // 预筛把整类拦死、单条现场采集 1600+。现在按 phraseRequiresDigit 自动划分。
  assert.equal(L.phraseRequiresDigit(/^(\d+)\s+items?$/i), true);
  assert.equal(L.phraseRequiresDigit(/Free (.+?) \((100%)\)$/i), true);    // 字面数字
  assert.equal(L.phraseRequiresDigit(/^(.+?)\s+task running on target\s+(.+?)\s+finished with status SUCCESS$/i), false);
  assert.equal(L.phraseRequiresDigit(/^Last updated at\b/i), false);
  // 无数字池非空且确实全部不要求数字
  const noDigit = L.PHRASES.filter(p => !L.phraseRequiresDigit(p[0]));
  assert.ok(noDigit.length > 0);
  for (const [re] of noDigit) assert.equal(L.phraseRequiresDigit(re), false);
});

// ── applyPhrases:行为 ────────────────────────────────────
test('applyPhrases: 数字模式各语言替换', () => {
  assert.equal(L.applyPhrases('3 Hosts', 'zh-CN'), '3 台主机');
  assert.equal(L.applyPhrases('3 Hosts', 'zh-TW'), '3 台主機');
  assert.equal(L.applyPhrases('3 Hosts', 'de'), '3 Hosts');
  assert.equal(L.applyPhrases('3 Hosts', 'ko'), '호스트 3대');
  assert.equal(L.applyPhrases('1 - 20 of 137 items', 'zh-CN'), '第 1 - 20 项,共 137 项');
  assert.equal(L.applyPhrases('267.45 GHz free', 'zh-CN'), '267.45 GHz 空闲');
  assert.equal(L.applyPhrases('The license expires in 30 days.', 'zh-CN'), '许可证将在 30 天后过期。');
});

test('applyPhrases: 无数字模式必须可达(历史预筛 bug 回归锁)', () => {
  const s = 'Query container volume async task running on target vc.knight.com finished with status SUCCESS';
  assert.equal(L.applyPhrases(s, 'zh-CN'),
    '在目标 vc.knight.com 上运行的“Query container volume async”任务已完成,状态为 SUCCESS');
  assert.equal(L.applyPhrases('esx01 (Maintenance Mode)', 'zh-CN'), 'esx01 (维护模式)');
  assert.equal(L.applyPhrases('a few seconds ago', 'zh-TW'), '幾秒前');
});

test('applyPhrases: 缺语言条目退英文原串,绝不跨语言污染', () => {
  // "Host N" 模式只有 zh-CN / zh-TW / ko,de 页面必须原样保留
  assert.equal(L.applyPhrases('Host 2', 'de'), 'Host 2');
  assert.equal(L.applyPhrases('Host 2', 'zh-CN'), '主机 2');
  // en / 未知语言:原样
  assert.equal(L.applyPhrases('3 Hosts', 'en'), '3 Hosts');
  assert.equal(L.applyPhrases('3 Hosts', null), '3 Hosts');
  assert.equal(L.applyPhrases('3 Hosts', 'fr'), '3 Hosts');
});

test('applyPhrases: 未命中任何模式返回原串', () => {
  assert.equal(L.applyPhrases('Some arbitrary label', 'zh-CN'), 'Some arbitrary label');
});
