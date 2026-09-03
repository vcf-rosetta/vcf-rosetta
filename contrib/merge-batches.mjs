// 把已译并通过审核的批次合入 plugin/i18n/domains/ 覆盖层,再并进 glossary。
//   node contrib/merge-batches.mjs <lang> [--class long|short] [--write]
//
// 默认 DRY-RUN,只报告将要发生什么;加 --write 才真正落盘。
//
// 落盘做两件事:
//   1) 写 plugin/i18n/domains/vcf9-<lang>-machine-draft-<YYYY-MM>.json
//      带 _note 明确标注 machine DRAFT + 覆盖批次 + 生成日期。这是本仓库既有惯例
//      (见 vcf9-vsphere-client-h5-it.json / vcf9-zh-TW-from-zhcn-draft.json):
//      清楚标注的机器草稿可接受,悄悄混进权威半边不可接受。
//   2) 把新词条并进 plugin/i18n/glossary.<lang>.json,按英文键不区分大小写排序。
//
// 【安全护栏】glossary 里已存在的键一律视为权威(已审定/已发布),绝不覆盖 ——
// 与 build-all-locales.mjs / enrich-from-pack.mjs 同一口径。批次里若出现已存在的键,
// 说明缺口算错了,直接跳过并报告。
//
// 合入后必须重建词典:node browser-extension/build-dict.mjs
// 并在 browser-extension/langs.json 里 bump 该语言 version,否则已装用户不会重新下载。
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [lang, ...flags] = process.argv.slice(2);
const has = f => flags.includes(f);
const flagVal = (name, dflt) => {
  const i = flags.indexOf(name);
  if (i < 0) return dflt;
  const v = flags[i + 1];
  if (v === undefined) throw new Error(`${name} 缺少取值`);
  return v;
};

if (!lang || !/^[a-z]{2}(-[A-Z]{2})?$/.test(lang)) {
  console.error("用法: node contrib/merge-batches.mjs <de|it|ko|zh-TW|zh-CN> [--class long|short] [--write]");
  process.exit(2);
}
const only = flagVal("--class", null);
if (only && !["long", "short"].includes(only)) {
  console.error(`--class 只能是 long 或 short,收到: ${only}`);
  process.exit(2);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "contrib/incoming", lang, "batches");
const glossaryPath = join(root, "plugin/i18n", `glossary.${lang}.json`);
if (!existsSync(dir)) { console.error(`没有 ${dir}`); process.exit(2); }
if (!existsSync(glossaryPath)) { console.error(`没有 glossary.${lang}.json`); process.exit(2); }

const glossary = new Map(Object.entries(JSON.parse(readFileSync(glossaryPath, "utf8"))));

const pattern = only ? new RegExp(`^${only}-\\d+\\.json$`) : /^(long|short)-\d+\.json$/;
const batchFiles = readdirSync(dir).filter(f => pattern.test(f)).sort();

const incoming = new Map();     // en -> tr
const stats = { files: 0, rows: 0, skippedExisting: 0, skippedEmpty: 0, conflicts: [] };
const usedFiles = [];

for (const f of batchFiles) {
  const obj = JSON.parse(readFileSync(join(dir, f), "utf8"));
  let taken = 0;
  for (const [en, tr] of Object.entries(obj)) {
    if (typeof tr !== "string" || !tr.trim()) { stats.skippedEmpty++; continue; }
    if (glossary.has(en)) { stats.skippedExisting++; continue; }
    // 同一英文键在两个批次里译法不同 —— 跨批次漂移没清干净,先报出来
    if (incoming.has(en) && incoming.get(en) !== tr) {
      stats.conflicts.push({ en, a: incoming.get(en), b: tr, file: f });
      continue;
    }
    incoming.set(en, tr);
    taken++;
  }
  if (taken) { stats.files++; usedFiles.push(f); }
  stats.rows += taken;
}

console.log(`${lang}: 扫描 ${batchFiles.length} 个批次文件,取到 ${stats.files} 个已填`);
console.log(`  可合入新词条 : ${incoming.size}`);
console.log(`  跳过(未填)   : ${stats.skippedEmpty}`);
console.log(`  跳过(已在库) : ${stats.skippedExisting}`);
console.log(`  跨批次冲突   : ${stats.conflicts.length}`);

if (stats.conflicts.length) {
  console.log("\n同一英文键在不同批次译法不一致 —— 先跑 check-consistency.mjs 清掉再合:");
  for (const c of stats.conflicts.slice(0, 15)) {
    console.log(`  ${c.en}\n     A: ${c.a}\n     B: ${c.b}  [${c.file}]`);
  }
  if (stats.conflicts.length > 15) console.log(`  ... 另有 ${stats.conflicts.length - 15} 条`);
  console.log("\n拒绝合入。");
  process.exit(1);
}
if (!incoming.size) { console.log("\n没有可合入的新词条。"); process.exit(0); }

const stamp = new Date().toISOString().slice(0, 7);
const domainName = `vcf9-${lang}-machine-draft-${stamp}.json`;
const domainPath = join(root, "plugin/i18n/domains", domainName);

const sortKeys = m => [...m.keys()].sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1));

const domainObj = { _note: `${lang} machine DRAFT ${stamp} —— 由 contrib/gap-batches.mjs 切批、机器翻译、contrib/check-batch.mjs 审核(0 error)后合入。覆盖批次: ${usedFiles.join(", ")}。产品/组件名保持英文;占位符原样保留。未经母语人工审校,短标签(<=20 字符)错误率实测约 25%,长串约 8%。` };
for (const k of sortKeys(incoming)) domainObj[k] = incoming.get(k);

const merged = new Map(glossary);
for (const [k, v] of incoming) merged.set(k, v);
const mergedObj = {};
for (const k of sortKeys(merged)) mergedObj[k] = merged.get(k);

if (!has("--write")) {
  console.log(`\n[DRY-RUN] 加 --write 才落盘。将要写:`);
  console.log(`  ${domainName}                 (${incoming.size} 条 + _note)`);
  console.log(`  glossary.${lang}.json          ${glossary.size} -> ${merged.size} 条`);
  console.log(`\n样例:`);
  for (const k of sortKeys(incoming).slice(0, 5)) console.log(`  ${k}\n     -> ${incoming.get(k)}`);
  console.log(`\n合入后须跑: node browser-extension/build-dict.mjs`);
  console.log(`并在 browser-extension/langs.json 里 bump ${lang} 的 version(否则已装用户不会重新下载)。`);
  process.exit(0);
}

if (existsSync(domainPath)) {
  console.error(`\n${domainName} 已存在 —— 拒绝覆盖。改批次范围或先处理已有文件。`);
  process.exit(1);
}
writeFileSync(domainPath, `${JSON.stringify(domainObj, null, 2)}\n`);
writeFileSync(glossaryPath, `${JSON.stringify(mergedObj, null, 2)}\n`);
console.log(`\n已写 plugin/i18n/domains/${domainName} (${incoming.size} 条)`);
console.log(`已写 glossary.${lang}.json  ${glossary.size} -> ${merged.size} 条`);
console.log(`\n下一步: node browser-extension/build-dict.mjs  然后 bump langs.json 里 ${lang} 的 version。`);
