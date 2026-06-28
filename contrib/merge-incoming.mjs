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

const [file, lang] = process.argv.slice(2);
if (!file || !lang) { console.error("用法: node contrib/merge-incoming.mjs <terms.json> <lang>"); process.exit(1); }
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

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
const translated = new Set(Object.keys(glossary).filter(k => glossary[k] && glossary[k] !== k && hasCJK(glossary[k])));

// 中文是目前最全的语言:为其它小语种附上 zh-CN 参考译文,翻译时可直接对照(见 contrib/gap-from-zh.mjs)。
const zhPath = join(root, "plugin/i18n", "glossary.zh-CN.json");
const zhRef = lang !== "zh-CN" && existsSync(zhPath) ? JSON.parse(readFileSync(zhPath, "utf8")) : {};

// 运行时数据 / 标识符过滤(与扩展 looksTranslatable 同口径,从严)
function isData(s) {
  if (s.length < 2) return true;                              // 不设长度上限(与扩展 looksTranslatable 同口径):容纳段落级长描述
  if (!/[A-Za-z]/.test(s)) return true;                       // 无字母
  if (/^[0-9.\-:/\s%|]+$/.test(s)) return true;               // 纯数字/时间/百分比
  if (/^[\d.,]+\s*(B|KB|MB|GB|TB|Hz|MHz|GHz|ms|%)/.test(s)) return true;
  if (/\d{2}\/\d{2}\/\d{4},/.test(s)) return true;            // 时间戳
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(s)) return true;      // UUID
  if (/\.(com|local|net|org)\b/.test(s)) return true;         // 主机名/FQDN
  if (/^task-\d+$/.test(s) || /^VSPHERE\.LOCAL\\/.test(s)) return true;
  if (/@vsphere\.local/i.test(s)) return true;
  return false;
}

const seen = new Set();
const candidates = {};
let dropTranslated = 0, dropData = 0;
for (const raw of terms) {
  const s = String(raw).trim();
  if (!s || seen.has(s)) continue; seen.add(s);
  if (translated.has(s)) { dropTranslated++; continue; }
  if (isData(s)) { dropData++; continue; }
  candidates[s] = "";
}

const keys = Object.keys(candidates).sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
const sorted = keys.reduce((o, k) => (o[k] = "", o), {});
const outDir = join(root, "contrib/incoming", lang);
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `candidates-${keys.length}.json`);
writeFileSync(outPath, JSON.stringify(sorted, null, 2) + "\n");

// 参考伴随文件:英文 → zh-CN 译文,供翻译时对照(中文最全)。仅在有可用参考时写出。
const refPairs = keys.filter(k => zhRef[k] && hasCJK(zhRef[k]));
let refPath = null;
if (refPairs.length) {
  const ref = refPairs.reduce((o, k) => (o[k] = zhRef[k], o), {});
  refPath = join(outDir, `candidates-${keys.length}.ref.json`);
  writeFileSync(refPath, JSON.stringify(ref, null, 2) + "\n");
}

console.log(`输入 ${terms.length} 条 → 候选 ${keys.length} 条待译`);
console.log(`  跳过已翻译 ${dropTranslated} · 跳过运行时数据 ${dropData}`);
console.log(`写出骨架:${outPath}`);
if (refPath) console.log(`写出 zh-CN 参考:${refPath}(${refPairs.length} 条可对照)`);
console.log(`下一步:对照参考补全译文后,移动/合并到 plugin/i18n/domains/,再 node browser-extension/build-dict.mjs`);
