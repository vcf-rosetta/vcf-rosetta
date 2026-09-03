// 机械生成「缺库内依据」的人工复核队列。
//   node contrib/flag-unsupported.mjs <lang> [--max-hits N] [--out <file>]
//
// 为什么需要:各 agent 会在报告里列出自己判不准的条目,但那只覆盖它恰好注意到的,
// 而且散落在几十份散文报告里。这个脚本对【全部】已译条目做同一件事,可复现、可 diff。
//
// 判定:取英文键里的实词(大写开头的词/词组),查它在 glossary.<lang> 的英文键里出现多少次。
// 若该条目的**所有**实词命中数都 <= MAX_HITS,说明这条完全没有库内先例可依 ——
// 译文只能靠推断,属人工复核的第一优先级。
//
// 注意这不是「翻错了」的清单,是「无据可依」的清单。VCF 9 的新概念(Fleet / Workbench /
// Canvas / control plane / commission)必然落在这里 —— 官方 8.0 语言包里根本没有这些词。
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_MAX_HITS = 2;
// 这些词到处都有,命中数高但不构成「术语依据」,统计时跳过
const SKIP = new Set([
  "The", "This", "That", "And", "For", "With", "From", "When", "All", "Add", "New",
  "Not", "Are", "Was", "Has", "Can", "You", "Your", "Its", "Use", "Set", "Get",
]);

const [lang, ...flags] = process.argv.slice(2);
const flagVal = (n, d) => { const i = flags.indexOf(n); return i < 0 ? d : flags[i + 1]; };
if (!lang || !/^[a-z]{2}(-[A-Z]{2})?$/.test(lang)) {
  console.error("用法: node contrib/flag-unsupported.mjs <de|it|ko|zh-TW|zh-CN> [--max-hits N] [--out <file>]");
  process.exit(2);
}
const maxHits = Number(flagVal("--max-hits", DEFAULT_MAX_HITS));
if (!Number.isInteger(maxHits) || maxHits < 0) { console.error("--max-hits 需为非负整数"); process.exit(2); }

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const glossaryPath = join(root, "plugin/i18n", `glossary.${lang}.json`);
const dir = join(root, "contrib/incoming", lang, "batches");
if (!existsSync(glossaryPath) || !existsSync(dir)) { console.error(`缺 glossary.${lang}.json 或 batches 目录`); process.exit(2); }

const glossKeys = Object.keys(JSON.parse(readFileSync(glossaryPath, "utf8"))).map(k => k.toLowerCase());
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hitCache = new Map();
const hits = term => {
  const t = term.toLowerCase();
  if (hitCache.has(t)) return hitCache.get(t);
  const re = new RegExp(`(^|[^a-z0-9])${esc(t)}(s|es)?([^a-z0-9]|$)`);
  const n = glossKeys.reduce((acc, k) => acc + (re.test(k) ? 1 : 0), 0);
  hitCache.set(t, n);
  return n;
};

// 实词:大写开头的单词,以及相邻的两词组合
const termsOf = en => {
  const words = en.split(/[^A-Za-z0-9-]+/).filter(Boolean);
  const out = [];
  for (let i = 0; i < words.length; i++) {
    if (!/^[A-Z]/.test(words[i]) || words[i].length < 3 || SKIP.has(words[i])) continue;
    out.push(words[i]);
    if (i + 1 < words.length && /^[A-Z]/.test(words[i + 1])) out.push(`${words[i]} ${words[i + 1]}`);
  }
  return [...new Set(out)];
};

const rows = [];
for (const f of readdirSync(dir).filter(f => /^(long|short)-\d+\.json$/.test(f)).sort()) {
  for (const [en, tr] of Object.entries(JSON.parse(readFileSync(join(dir, f), "utf8")))) {
    if (typeof tr !== "string" || !tr.trim()) continue;
    const terms = termsOf(en);
    if (!terms.length) continue;
    const counts = terms.map(t => [t, hits(t)]);
    const best = Math.max(...counts.map(([, n]) => n));
    if (best > maxHits) continue;
    rows.push({ file: f.replace(/\.json$/, ""), en, tr, evidence: counts.sort((a, b) => b[1] - a[1]) });
  }
}

rows.sort((a, b) => (a.en.toLowerCase() < b.en.toLowerCase() ? -1 : 1));
const out = flagVal("--out", null);
const lines = [
  `# ${lang} 机翻:缺库内依据的条目(人工复核队列)`,
  "",
  `由 \`node contrib/flag-unsupported.mjs ${lang} --max-hits ${maxHits}\` 生成,可复现。`,
  "",
  `判定:该条目英文键里的**所有**实词在 \`glossary.${lang}.json\` 的英文键中命中数都 <= ${maxHits},`,
  "即完全没有库内先例可依,译文只能靠推断。",
  "",
  `**这不是「翻错了」的清单,是「无据可依」的清单。** VCF 9 的新概念必然落在这里 ——`,
  "官方 8.0 语言包里没有这些词,只能等有母语运维实际看到界面才能定。",
  "",
  `共 ${rows.length} 条。`,
  "",
  "| 批次 | 英文 | 当前译文 | 实词命中数 |",
  "|---|---|---|---|",
  ...rows.map(r => `| ${r.file} | ${r.en.replace(/\|/g, "\\|").slice(0, 70)} | ${r.tr.replace(/\|/g, "\\|").slice(0, 70)} | ${r.evidence.slice(0, 3).map(([t, n]) => `${t}:${n}`).join(", ")} |`),
];
if (out) { writeFileSync(join(root, out), `${lines.join("\n")}\n`); console.log(`${lang}: ${rows.length} 条 → ${out}`); }
else console.log(lines.slice(0, 40).join("\n") + (rows.length > 25 ? `\n... 共 ${rows.length} 条,用 --out 写文件` : ""));
