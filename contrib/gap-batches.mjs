// 为某个小语种切分「待机翻批次」——按并集基准算缺口,按串长分风险等级,输出定长批次文件。
//
//   node contrib/gap-batches.mjs <de|it|ko|zh-TW|zh-CN> [--size N] [--class long|short]
//
// 基准 = 全部 5 个 glossary 的英文键并集(不是 zh-CN 单语:zh-CN 不是超集,
//        de/it/ko 各有数百条 zh-CN 没有的真串,按 zh-CN 裁齐会砍掉它们)。
// 风险分级(实测,见 contrib/README.md):
//   long  >20 字符  错误率约 8%   —— 错误消息/描述,用户最需要且无法自行看懂
//   short ≤20 字符  错误率约 25%  —— 按钮/菜单/列名,动名歧义高发,需跨语言分歧筛查
// 过滤复用扩展端权威口径 content/lib.js(looksTranslatable / applyPhrases),避免本地副本漂移。
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const LOCALE_RE = /^glossary\.([a-z]{2}(-[A-Z]{2})?)\.json$/;
const SHORT_MAX = 20;          // 风险分界:实测短标签错误率 25% vs 长串 8%
const DEFAULT_BATCH = 150;

const [lang, ...flags] = process.argv.slice(2);
const flagVal = (name, dflt) => {
  const i = flags.indexOf(name);
  if (i < 0) return dflt;
  const v = flags[i + 1];
  if (v === undefined) throw new Error(`${name} 缺少取值`);
  return v;
};

if (!lang || !/^[a-z]{2}(-[A-Z]{2})?$/.test(lang)) {
  console.error("用法: node contrib/gap-batches.mjs <de|it|ko|zh-TW|zh-CN> [--size N] [--class long|short]");
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const i18n = join(root, "plugin/i18n");
const require = createRequire(import.meta.url);
const L = require(join(root, "browser-extension/content/lib.js"));

const size = Number(flagVal("--size", DEFAULT_BATCH));
if (!Number.isInteger(size) || size < 1 || size > 2000) {
  console.error(`--size 需为 1..2000 的整数,收到: ${flagVal("--size", DEFAULT_BATCH)}`);
  process.exit(1);
}
const only = flagVal("--class", null);
if (only && !["long", "short"].includes(only)) {
  console.error(`--class 只能是 long 或 short,收到: ${only}`);
  process.exit(1);
}

// 读全部 locale glossary → 并集基准
const files = readdirSync(i18n).filter(f => LOCALE_RE.test(f));
const byLocale = new Map();
for (const f of files) {
  byLocale.set(f.match(LOCALE_RE)[1], new Map(Object.entries(JSON.parse(readFileSync(join(i18n, f), "utf8")))));
}
if (!byLocale.has(lang)) { console.error(`没有 glossary.${lang}.json`); process.exit(1); }

const union = new Set();
for (const m of byLocale.values()) for (const k of m.keys()) union.add(k);

const target = byLocale.get(lang);
const zhRef = byLocale.get("zh-CN") ?? new Map();

// 过滤:非「值得翻译的英文」或命中 PHRASES 受控模式(动态数值串)的剔除
const keep = s => L.looksTranslatable(s) && L.applyPhrases(s, "zh-CN") === s;
const gap = [...union]
  .filter(k => !target.has(k) && keep(k))
  .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1));

const classOf = k => (k.length <= SHORT_MAX ? "short" : "long");
const groups = { long: gap.filter(k => classOf(k) === "long"), short: gap.filter(k => classOf(k) === "short") };

const outDir = join(root, "contrib/incoming", lang, "batches");
mkdirSync(outDir, { recursive: true });

console.log(`并集基准 ${union.size} 条 | ${lang} 已有 ${target.size} | 过滤后缺口 ${gap.length}`);
for (const [cls, keys] of Object.entries(groups)) {
  if (only && cls !== only) continue;
  const nBatches = Math.ceil(keys.length / size);
  console.log(`  ${cls}: ${keys.length} 条 → ${nBatches} 批 × ${size}`);
  for (let i = 0; i < nBatches; i++) {
    const slice = keys.slice(i * size, (i + 1) * size);
    const no = String(i + 1).padStart(3, "0");
    // 骨架:{英文: ""} —— 译完原地填,不改结构
    const skel = slice.reduce((o, k) => { o[k] = ""; return o; }, Object.create(null));
    // 参考:zh-CN 译文。注意实测中文对短标签动名歧义无消歧能力(错误相关),
    // 仅作术语/语义参考,不可当作 POS 依据。
    const ref = slice.reduce((o, k) => { o[k] = zhRef.get(k) ?? ""; return o; }, Object.create(null));
    writeFileSync(join(outDir, `${cls}-${no}.json`), JSON.stringify(skel, null, 1) + "\n");
    writeFileSync(join(outDir, `${cls}-${no}.ref.json`), JSON.stringify(ref, null, 1) + "\n");
  }
}
console.log(`输出 → ${outDir}`);
