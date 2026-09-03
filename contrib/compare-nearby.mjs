// 用【近重复英文键】给机翻质量做地面实况对标。
//   node contrib/compare-nearby.mjs <lang> [--dump substantive.tsv]
//
// 思路:机翻的缺口条目与 glossary 里已有官方译文的条目,存在大量「只差标点/大小写」
// 的近重复(`Add Host` vs `Add host...`)。这类键语义等价,于是官方译文就成了
// 可比对的地面实况 —— 不用人工标注也能量化机翻与官方的差距。
//
// 三档:
//   exact       译文完全一致
//   punct       只差标点/大小写/首尾空白
//   substantive 实质不同 —— 需再分「语域差异 / 术语选择 / 真错」,单靠机器分不了,故 --dump 供人工看
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [lang, ...flags] = process.argv.slice(2);
const flagVal = (n, d) => { const i = flags.indexOf(n); return i < 0 ? d : flags[i + 1]; };
if (!lang) { console.error("用法: node contrib/compare-nearby.mjs <lang> [--dump file.tsv]"); process.exit(2); }

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const gloss = JSON.parse(readFileSync(join(root, "plugin/i18n", `glossary.${lang}.json`), "utf8"));
const dir = join(root, "contrib/incoming", lang, "batches");
if (!existsSync(dir)) { console.error(`没有 ${dir}`); process.exit(2); }

// 英文键归一:去标点、折叠空白、小写。这是「近重复」的定义。
const normKey = s => s.toLowerCase().replace(/[.…:;,!?()[\]{}"'`’\-_/\\]+/g, " ").replace(/\s+/g, " ").trim();
// 译文归一:同上,用于区分「只差标点」与「实质不同」
const normTr = s => s.toLowerCase().replace(/[.…:;,!?()[\]{}"'`’\-_/\\ ]+/g, " ").replace(/\s+/g, " ").trim();

const official = new Map();      // normKey -> { en, tr }
for (const [en, tr] of Object.entries(gloss)) {
  if (typeof tr !== "string" || !tr.trim()) continue;
  const k = normKey(en);
  if (!official.has(k)) official.set(k, { en, tr });
}

const rows = [];
for (const f of readdirSync(dir).filter(f => /^(long|short)-\d+\.json$/.test(f)).sort()) {
  for (const [en, tr] of Object.entries(JSON.parse(readFileSync(join(dir, f), "utf8")))) {
    if (typeof tr !== "string" || !tr.trim()) continue;
    const o = official.get(normKey(en));
    if (!o) continue;
    if (o.en === en) continue;                       // 同键不算近重复(实际不会发生)
    const cls = o.tr === tr ? "exact" : (normTr(o.tr) === normTr(tr) ? "punct" : "substantive");
    rows.push({ file: f.replace(/\.json$/, ""), en, mine: tr, refEn: o.en, ref: o.tr, cls });
  }
}

const n = rows.length;
const c = k => rows.filter(r => r.cls === k).length;
const pct = x => `${(100 * x / Math.max(n, 1)).toFixed(1)}%`;
console.log(`${lang}: 近重复对标 ${n} 对`);
console.log(`  完全一致   ${c("exact")}  ${pct(c("exact"))}`);
console.log(`  只差标点   ${c("punct")}  ${pct(c("punct"))}`);
console.log(`  实质不同   ${c("substantive")}  ${pct(c("substantive"))}`);

const dump = flagVal("--dump", null);
if (dump) {
  const sub = rows.filter(r => r.cls === "substantive");
  writeFileSync(join(root, dump),
    ["批次\t英文(机翻侧)\t机翻译文\t英文(库内侧)\t官方译文",
     ...sub.map(r => [r.file, r.en, r.mine, r.refEn, r.ref].map(s => s.replace(/\t/g, " ")).join("\t"))].join("\n") + "\n");
  console.log(`  实质不同已写入 ${dump} (${sub.length} 条)`);
}
