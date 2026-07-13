// 维护者侧:把一份「未翻译词条」JSON(来自扩展一键贡献的 Issue,或本地导出)
// 去重整理成待翻译骨架,放到 contrib/incoming/<lang>/,供翻译后并入 plugin/i18n/domains/。
//
//   node contrib/merge-incoming.mjs <terms.json> <lang>
//   # terms.json: 一个英文字符串数组 ["About VMware vSphere", ...]
//   # lang:       目标语言,如 zh-CN / ja / fr
//
// 逻辑:① 丢掉该语言 glossary 里已翻译的;② 丢掉明显的运行时数据(时间戳/容量/UUID/
// 主机名/纯数字等);③ 输出 { "英文": "" } 骨架文件,人工补译后即可作为 domain 文件构建。
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const [file, lang] = process.argv.slice(2);
if (!file || !lang) { console.error("用法: node contrib/merge-incoming.mjs <terms.json> <lang>"); process.exit(1); }
// lang 用作路径片段与文件名 —— 严格校验为 locale 形态,挡住 ../ 目录穿越(输入来自不可信 Issue)。
if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(lang)) { console.error(`非法 lang(需 locale 形态,如 zh-CN/ja/fr): ${lang}`); process.exit(1); }
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// 复用扩展端权威过滤器(content/lib.js 的 looksTranslatable / applyPhrases),避免本地副本漂移。
const require = createRequire(import.meta.url);
const L = require(join(root, "browser-extension/content/lib.js"));

// 接受多种形态:字符串数组 / 对象数组[{text}] / {entries:[{text}]} / {text:meta}
const parsed = JSON.parse(readFileSync(file, "utf8"));
function toStrings(p) {
  if (Array.isArray(p)) return p.map(x => (typeof x === "string" ? x : x && x.text)).filter(Boolean);
  if (p && Array.isArray(p.entries)) return toStrings(p.entries);
  if (p && typeof p === "object") return Object.keys(p);
  return [];
}
const terms = toStrings(parsed);
if (!terms.length) { console.error("无法从输入提取词条(支持:字符串数组 / [{text}] / {entries} / {key:val})"); process.exit(1); }

const glossaryPath = join(root, "plugin/i18n", `glossary.${lang}.json`);
const glossary = existsSync(glossaryPath) ? JSON.parse(readFileSync(glossaryPath, "utf8")) : {};
const hasCJK = s => /[一-鿿]/.test(s);
// 用 Object.entries(自有可枚举项,__proto__/constructor 的取值也正确)而非 keys+方括号取值
// (obj["__proto__"] 会返回原型而非自有值,是隐蔽 bug)。
const translated = new Set(
  Object.entries(glossary)
    .filter(([k, v]) => typeof v === "string" && v && v !== k && hasCJK(v))
    .map(([k]) => k)
);

// 中文是目前最全的语言:为其它小语种附上 zh-CN 参考译文,翻译时可直接对照(见 contrib/gap-from-zh.mjs)。
const zhPath = join(root, "plugin/i18n", "glossary.zh-CN.json");
const zhRefObj = lang !== "zh-CN" && existsSync(zhPath) ? JSON.parse(readFileSync(zhPath, "utf8")) : {};
const zhRef = new Map(Object.entries(zhRefObj));   // Map 正确处理任意键(含 __proto__/constructor)

// 过滤:非「值得翻译的英文」(扩展权威口径 looksTranslatable),或命中 PHRASES 受控模式
// (动态数值串,归 PHRASES 而非词典)的一律剔除。
const isDrop = s => !L.looksTranslatable(s) || L.applyPhrases(s, "zh-CN") !== s;

const seen = new Set();
const candidates = new Map();
let dropTranslated = 0, dropData = 0;
for (const raw of terms) {
  const s = String(raw).trim();
  if (!s || seen.has(s)) continue; seen.add(s);
  if (translated.has(s)) { dropTranslated++; continue; }
  if (isDrop(s)) { dropData++; continue; }
  candidates.set(s, "");
}

const keys = [...candidates.keys()].sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
const sorted = keys.reduce((o, k) => (o[k] = "", o), Object.create(null));
const outDir = join(root, "contrib/incoming", lang);
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `candidates-${keys.length}.json`);
writeFileSync(outPath, JSON.stringify(sorted, null, 2) + "\n");

// 参考伴随文件:英文 → zh-CN 译文,供翻译时对照(中文最全)。仅在有可用参考时写出。
const refPairs = keys.filter(k => zhRef.get(k) && hasCJK(zhRef.get(k)));
let refPath = null;
if (refPairs.length) {
  const ref = refPairs.reduce((o, k) => (o[k] = zhRef.get(k), o), Object.create(null));
  refPath = join(outDir, `candidates-${keys.length}.ref.json`);
  writeFileSync(refPath, JSON.stringify(ref, null, 2) + "\n");
}

console.log(`输入 ${terms.length} 条 → 候选 ${keys.length} 条待译`);
console.log(`  跳过已翻译 ${dropTranslated} · 跳过运行时数据 ${dropData}`);
console.log(`写出骨架:${outPath}`);
if (refPath) console.log(`写出 zh-CN 参考:${refPath}(${refPairs.length} 条可对照)`);
console.log(`下一步:对照参考补全译文后,移动/合并到 plugin/i18n/domains/,再 node browser-extension/build-dict.mjs`);
