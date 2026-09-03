// 跨批次术语一致性检查 —— check-batch.mjs 的补集。
//   node contrib/check-consistency.mjs <lang>
//
// check-batch 只看单个批次,拿它跟 glossary 比(W3)。但多批次并行机翻(尤其分给
// 不同译者/agent)会产生【批次之间】的漂移:同一英文术语,glossary 里没有先例,
// 于是 A 批译成 X、B 批译成 Y,两边各自都过 W3。实测这样漏过三处:
//   Heartbeat Datastore -> Taktsignal-Datenspeicher / Heartbeat-Datenspeicher
//   Passphrase          -> Kennwortsatz            / Passphrase
//   Workload Domain     -> Arbeitslastdomäne       / Workload-Domäne
//
// 做法:把该语言【全部已填批次】当成一份语料,找出跨批次出现的英文术语,
// 检查其译文里的关键词元是否「一半有一半没有」—— 那就是分歧。
// 只报 WARN 并附例句,由人判断哪个对(通常查 glossary 频次或其它语言先例)。
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeTokenizer, makeStemmer } from "./lang-tokens.mjs";

const MIN_OCC = 3;          // 术语至少跨批次出现这么多次才检查
const MIN_FILES = 2;        // 且至少出现在这么多个不同批次文件里
const SPLIT_LOW = 0.3;      // 词元出现率落在 [LOW, HIGH] 即视为「分歧」
const SPLIT_HIGH = 0.85;
const MIN_TOKEN_LEN = 6;
// 术语必须占据英文键的主体,否则 Cluster/Policy/Settings 这类通用词会满屏误报 ——
// 它们在不同复合词里本就该有不同译法(正常德语构词,不是漂移)。
// "Heartbeat Datastore" 在 "Add Heartbeat Datastore" 里占 78% → 查;
// "Cluster" 在一个长句里占 5% → 不查。
const MIN_COVERAGE = 0.4;
const MIN_SOLO_LEN = 8;      // 单词术语要够长(Passphrase 可以,Cluster 不行)
const MAX_SHOWN = 30;
// 「强信号」判据:真正的跨批次漂移长这样 —— 同一术语有两个【互斥】的译法,
// 各占一部分且从不同时出现(Taktsignal / Heartbeat 不会同现)。
// 而噪声长这样:被标记的词元其实来自英文键的【其余部分】,与竞争译法无关,
// 所以它跟别的词元可以自由同现(`dominio` 与 `carico` 同现于一条译文里)。
// 实测宽判据每语言报 ~1200 条、抽样几乎全是噪声;加上互斥+覆盖率后才可用。
const PAIR_COVERAGE = 0.85;  // 两个互斥词元合起来要覆盖这么多条,才算「二分」而非零散措辞
const PLACEHOLDER = /\{[A-Za-z_][\w.]*\}|\[data\.[\w.]+\]|%\(\d+\)s|%[sd@]|\{\d+\}/g;

const [lang] = process.argv.slice(2);
if (!lang || !/^[a-z]{2}(-[A-Z]{2})?$/.test(lang)) {
  console.error("用法: node contrib/check-consistency.mjs <de|it|ko|zh-TW|zh-CN>");
  process.exit(2);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "contrib/incoming", lang, "batches");
if (!existsSync(dir)) { console.error(`没有 ${dir}`); process.exit(2); }

// 只收「已填」的批次(值非空),跳过骨架
const corpus = [];   // { en, tr, file }
const files = readdirSync(dir).filter(f => /^(long|short)-\d+\.json$/.test(f)).sort();
const filled = [];
for (const f of files) {
  const obj = JSON.parse(readFileSync(join(dir, f), "utf8"));
  const rows = Object.entries(obj).filter(([, v]) => typeof v === "string" && v.trim());
  if (!rows.length) continue;
  filled.push(f);
  for (const [en, tr] of rows) corpus.push({ en, tr, file: f });
}
if (corpus.length === 0) { console.log("没有已填批次"); process.exit(0); }

// 词元提取与词干【按语言分派】,见 lang-tokens.mjs。之前硬编码德语名词大写规则,
// 对意大利语抽不到词 → 分歧检测静默失效。
const tokensOf = makeTokenizer(lang, PLACEHOLDER);
const stemOf = makeStemmer(lang);
// 复合词整体是一个词元(德语 "Komponentenkonfiguration" 不含词元 "konfiguration"),
// 用词元精确匹配会把正常构词判成分歧(实测 628 条里绝大多数是这个)。改用子串+词干比对。
const hasTerm = (tr, tok) => tr.toLowerCase().includes(stemOf(tok));

const wordRe = term => new RegExp(`(^|[^a-z0-9])${term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i");

// 候选术语:大写开头的 1-2 词片段
const candidates = new Set();
for (const { en } of corpus) {
  const words = en.split(/[^A-Za-z0-9-]+/).filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    if (!/^[A-Z]/.test(words[i])) continue;
    // 大小写归一,免得 Configuration / CONFIGURATION 报成两条
    if (words[i].length >= MIN_SOLO_LEN) candidates.add(words[i].toLowerCase());
    if (i + 1 < words.length && /^[A-Z]/.test(words[i + 1])) {
      candidates.add(`${words[i]} ${words[i + 1]}`.toLowerCase());
    }
  }
}

const findings = [];
for (const term of candidates) {
  const re = wordRe(term);
  const hits = corpus.filter(r => re.test(r.en) && term.length / r.en.length >= MIN_COVERAGE);
  if (hits.length < MIN_OCC) continue;
  if (new Set(hits.map(h => h.file)).size < MIN_FILES) continue;

  const df = new Map();
  for (const h of hits) for (const t of tokensOf(h.tr)) df.set(t, (df.get(t) ?? 0) + 1);

  for (const [tok] of df) {
    const n = hits.filter(h => hasTerm(h.tr, tok)).length;
    const ratio = n / hits.length;
    if (ratio < SPLIT_LOW || ratio > SPLIT_HIGH) continue;
    const withTok = hits.filter(h => hasTerm(h.tr, tok));
    const without = hits.filter(h => !hasTerm(h.tr, tok));
    // 两边都要跨到不同文件,否则只是同一批次内部的正常措辞差异
    if (new Set([...withTok, ...without].map(h => h.file)).size < MIN_FILES) continue;
    findings.push({ term, tok, n, of: hits.length, withTok: withTok[0], without: without[0], setWith: withTok, hits });
  }
}

// —— 强信号:在同一术语的候选词元里找【互斥且合起来近乎全覆盖】的一对 ——
const byTerm = new Map();
for (const f of findings) { if (!byTerm.has(f.term)) byTerm.set(f.term, []); byTerm.get(f.term).push(f); }
const strong = [];
for (const [term, fs] of byTerm) {
  for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
    const A = fs[i], B = fs[j];
    const setA = new Set(A.setWith), setB = new Set(B.setWith);
    // 互斥:没有任何一条译文同时含这两个词元
    if ([...setA].some(h => setB.has(h))) continue;
    // 覆盖:两者合起来占该术语条目的绝大多数(否则只是零散措辞差异)
    if ((setA.size + setB.size) / A.of < PAIR_COVERAGE) continue;
    // 一个词元是另一个的子串(Benachrichtigung / Benachrichtigungsregel)属构词,不是分歧
    if (A.tok.includes(B.tok) || B.tok.includes(A.tok)) continue;
    strong.push({ term, a: A, b: B, of: A.of });
  }
}
strong.sort((x, y) => y.of - x.of);

findings.sort((a, b) => b.of - a.of);
console.log(`${lang}: ${filled.length} 个已填批次 / ${corpus.length} 条译文`);
if (!findings.length) { console.log("跨批次术语一致"); process.exit(0); }

console.log(`\n【强信号】互斥二分 (${strong.length}) —— 这类才像真漂移,优先看:`);
if (!strong.length) console.log("  无");
for (const s2 of strong.slice(0, MAX_SHOWN)) {
  console.log(`  "${s2.term}" —— "${s2.a.tok}" ${s2.a.n}/${s2.of}  vs  "${s2.b.tok}" ${s2.b.n}/${s2.of}`);
  console.log(`     [${s2.a.withTok.file}] ${s2.a.withTok.en}\n         -> ${s2.a.withTok.tr}`);
  console.log(`     [${s2.b.withTok.file}] ${s2.b.withTok.en}\n         -> ${s2.b.withTok.tr}`);
}
if (strong.length > MAX_SHOWN) console.log(`  ... 另有 ${strong.length - MAX_SHOWN} 条`);

console.log(`\n【弱信号】宽判据 (${findings.length}) —— 抽样显示绝大多数是噪声(被标记词元来自英文键其余部分),仅供检索:`);
for (const f of findings.slice(0, MAX_SHOWN)) {
  console.log(`  "${f.term}" —— 译文含 "${f.tok}" 的 ${f.n}/${f.of}`);
  console.log(`     [${f.withTok.file}] ${f.withTok.en}\n         -> ${f.withTok.tr}`);
  console.log(`     [${f.without.file}] ${f.without.en}\n         -> ${f.without.tr}`);
}
if (findings.length > MAX_SHOWN) console.log(`  ... 另有 ${findings.length - MAX_SHOWN} 条`);
console.log("\n注:分歧不等于错误 —— 同一英文词在不同产品语境下本就可能不同译法。逐条查 glossary 频次或其它语言先例后再定。");
