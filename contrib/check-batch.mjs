// 审核一个已填的机翻批次,合入 domains/ 之前必须通过。
//   node contrib/check-batch.mjs <batch.json> <lang>
//
// 检查项(任一 ERROR 即拒绝合入):
//   E1 键漂移      —— 键集必须与抽取时一致(机翻过程不得增删/改写英文键)
//   E2 空译文      —— 未填
//   E3 占位符丢失  —— {x} / [data.x] / %(0)s / %s 等在译文中必须原样保留
//   E4 专名被翻译  —— 产品/组件名必须保持英文(见 aria-family-product-name-policy)
//   E5 与权威冲突  —— 该英文键在 glossary 里已有译文(说明缺口算错了,不该出现在批次里)
//   W1 疑似漏译    —— 译文与英文完全相同(专有名词/字面量属正常,需人工确认)
//   W2 大小写变体  —— 仅大小写不同的英文键被译成了不同德文(通常应一致)
//   W3 术语偏离    —— 该英文术语在既有 glossary 里有压倒性主流译法,本批次没跟
//
// W3 是实测最有价值的一项:首批 150 条里靠它抓出 Datastore->Datenspeicher(库内 993:73)
// 与 Malicious->boesartig 两处偏离。主流译法【从 glossary 现算】,不写死对照表 ——
// 词库演进时检查口径自动跟随。
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeTokenizer, makeStemmer } from "./lang-tokens.mjs";

// 必须在译文中原样出现的产品/组件名。只列「整词即专名」的,避免误报。
//
// 【为什么按语言分派】这张表原先是语言无关的,实测出了错:E4 是【硬错误】,一旦列错
// 就会强制所有批次产出错误译文,而且不报警 —— 检查器自己成了错误来源。
// 审计三份 glossary(按词边界)发现三处:
//   Load Balancer  de 0% / it 0% / ko 0%  —— 三语都翻(Lastausgleich / bilanciamento del carico / 로드 밸런서)
//   Supervisor     de 100% / it 42% / ko 25%(vSphere 语境)—— 只有德语保留
//   DataSets       de 36/36 / ko 36/36 保留【单数 DataSet】/ it 4/36 —— 形态是单数,且意语翻译
// 新增专名前必须先做同样的词边界审计,不能凭印象。
const PROTECTED_COMMON = [
  "NSX", "vSphere", "vSAN", "vCenter", "ESXi", "ESX", "VCF", "vMotion", "vLCM",
  "Orchestrator", "Fault Tolerance", "Chargeback", "Super Metric", "Global Manager",
  "VMware", "Aria", "SDDC", "Tier-0", "Tier-1", "vApp", "VMware Tools",
  "Single Sign-On", "Active Directory",
];
const PROTECTED_BY_LANG = {
  de: ["Supervisor", "DataSet"],
  it: [],
  ko: ["DataSet"],
  "zh-CN": [],
  "zh-TW": [],
};

const PLACEHOLDER = /\{[A-Za-z_][\w.]*\}|\[data\.[\w.]+\]|%\(\d+\)s|%[sd@]|\{\d+\}/g;
const MAX_SHOWN = 40;

const [batchPath, lang] = process.argv.slice(2);
if (!batchPath || !lang) {
  console.error("用法: node contrib/check-batch.mjs <batch.json> <lang>");
  process.exit(2);
}
if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(lang)) {
  console.error(`非法 lang(需 locale 形态): ${lang}`);
  process.exit(2);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const glossaryPath = join(root, "plugin/i18n", `glossary.${lang}.json`);
if (!existsSync(glossaryPath)) {
  console.error(`缺 glossary.${lang}.json`);
  process.exit(2);
}

const PROTECTED = [...PROTECTED_COMMON, ...(PROTECTED_BY_LANG[lang] ?? [])];

const batch = new Map(Object.entries(JSON.parse(readFileSync(batchPath, "utf8"))));
const glossary = new Map(Object.entries(JSON.parse(readFileSync(glossaryPath, "utf8"))));
const refPath = batchPath.replace(/\.json$/, ".ref.json");
const refKeys = existsSync(refPath) ? Object.keys(JSON.parse(readFileSync(refPath, "utf8"))) : null;

const errors = [];
const warns = [];
const push = (arr, code, key, msg) => arr.push({ code, key, msg });

// E1 键漂移
if (refKeys) {
  const cur = new Set(batch.keys());
  const orig = new Set(refKeys);
  for (const k of orig) if (!cur.has(k)) push(errors, "E1", k, "键在批次中丢失");
  for (const k of cur) if (!orig.has(k)) push(errors, "E1", k, "批次中出现抽取时没有的键");
}

const byLower = new Map();   // 小写英文键 -> 德译集合(W2)
for (const [en, raw] of batch) {
  const de = String(raw ?? "");
  if (!de.trim()) { push(errors, "E2", en, "译文为空"); continue; }

  const inEn = (en.match(PLACEHOLDER) ?? []).slice().sort();
  const inDe = (de.match(PLACEHOLDER) ?? []).slice().sort();
  if (inEn.join(" ") !== inDe.join(" ")) {
    push(errors, "E3", en, `占位符不匹配 英[${inEn.join(",")}] 译[${inDe.join(",")}]`);
  }

  for (const p of PROTECTED) {
    if (en.includes(p) && !de.includes(p)) push(errors, "E4", en, `专名 "${p}" 未在译文中保留`);
  }

  if (glossary.has(en)) push(errors, "E5", en, `glossary.${lang} 已有译文: ${glossary.get(en)}`);
  if (de === en) push(warns, "W1", en, "译文与英文相同(专名/字面量可接受)");

  const lk = en.toLowerCase();
  if (!byLower.has(lk)) byLower.set(lk, new Set());
  byLower.get(lk).add(de);
}

for (const [lk, set] of byLower) {
  if (set.size > 1) push(warns, "W2", lk, `仅大小写不同的英文键有 ${set.size} 种德译: ${[...set].join(" | ")}`);
}

// ---- W3 术语偏离 ---------------------------------------------------------
// 从 glossary 现算每个英文术语的主流译法:取「英文键含该术语」的全部条目,
// 找出在其译文中出现率 >= DOMINANCE 的德语词元;要求该词元在全库里足够罕见
// (DISTINCT_MAX),否则 werden/Einstellungen 这类高频词会满屏误报。
const MIN_SUPPORT = 15;      // 术语至少要有这么多条既有译例,才谈得上「主流」
const DOMINANCE = 0.75;      // 主流词元在这些译例中的出现率下限
const DISTINCT_MAX = 0.05;   // 该词元在全库译文中的出现率上限(超过即视为通用词)

// 词元提取与词干比对【按语言分派】—— 见 lang-tokens.mjs 的说明。
// 之前这里硬编码了德语名词大写规则,对意大利语几乎抽不到词 → convention 表接近空
// → W3 整体失声【且不报错】,是最危险的静默失效。
const tokensOf = makeTokenizer(lang, PLACEHOLDER);
const stemOf = makeStemmer(lang);

// 术语按词边界匹配,否则 "Super" 会命中 "Supervisor",给出 Super Metric 该译成
// supervisor 的荒谬建议。
const wordRe = term => new RegExp(`(^|[^a-z0-9])${term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i");

const glossEntries = [...glossary.entries()].filter(([, v]) => typeof v === "string");
const lowerKeys = glossEntries.map(([k, v]) => [k.toLowerCase(), v]);
const globalDf = new Map();
for (const [, v] of glossEntries) for (const t of tokensOf(v)) globalDf.set(t, (globalDf.get(t) ?? 0) + 1);

// 候选术语:批次英文键里以大写开头的 1-2 词片段(产品名交给 E4,这里管普通术语)
const candidates = new Set();
for (const en of batch.keys()) {
  const words = en.split(/[^A-Za-z0-9-]+/).filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    if (!/^[A-Z]/.test(words[i])) continue;
    candidates.add(words[i]);
    if (i + 1 < words.length && /^[A-Z]/.test(words[i + 1])) candidates.add(`${words[i]} ${words[i + 1]}`);
  }
}

const convention = new Map();   // 英文术语 -> 主流德语词元
for (const term of candidates) {
  if (term.length < 4) continue;
  if (PROTECTED.some(p => p.toLowerCase() === term.toLowerCase())) continue;
  const lt = term.toLowerCase();
  const re = wordRe(lt);
  const hits = lowerKeys.filter(([k]) => re.test(k));
  if (hits.length < MIN_SUPPORT) continue;
  const df = new Map();
  for (const [, v] of hits) for (const t of tokensOf(v)) df.set(t, (df.get(t) ?? 0) + 1);
  let best = null;
  for (const [t, n] of df) {
    if (n / hits.length < DOMINANCE) continue;
    if ((globalDf.get(t) ?? 0) / glossEntries.length > DISTINCT_MAX) continue;
    if (!best || n > best.n) best = { token: t, n, of: hits.length };
  }
  if (best) convention.set(term, best);
}

for (const [en, raw] of batch) {
  const de = String(raw ?? "");
  if (!de.trim()) continue;
  for (const [term, conv] of convention) {
    if (!wordRe(term).test(en)) continue;
    if (de.toLowerCase().includes(stemOf(conv.token))) continue;
    push(warns, "W3", en, `"${term}" 库内主流译法含 "${conv.token}" (${conv.n}/${conv.of}),本条未采用: ${de}`);
  }
}

const show = (arr, label) => {
  if (!arr.length) return;
  console.log(`\n${label} (${arr.length}):`);
  for (const e of arr.slice(0, MAX_SHOWN)) console.log(`  [${e.code}] ${e.key}\n        ${e.msg}`);
  if (arr.length > MAX_SHOWN) console.log(`  ... 另有 ${arr.length - MAX_SHOWN} 条`);
};

console.log(`批次 ${batchPath} | ${lang} | ${batch.size} 条`);
show(errors, "ERROR");
show(warns, "WARN");
console.log(errors.length || warns.length ? `\n结果: ${errors.length} error / ${warns.length} warn` : "\n全部通过");
process.exit(errors.length ? 1 : 0);
