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

const terms = JSON.parse(readFileSync(file, "utf8"));
if (!Array.isArray(terms)) { console.error("输入必须是 JSON 字符串数组"); process.exit(1); }

const glossaryPath = join(root, "plugin/i18n", `glossary.${lang}.json`);
const glossary = existsSync(glossaryPath) ? JSON.parse(readFileSync(glossaryPath, "utf8")) : {};
const hasCJK = s => /[一-鿿]/.test(s);
const translated = new Set(Object.keys(glossary).filter(k => glossary[k] && glossary[k] !== k && hasCJK(glossary[k])));

// 运行时数据 / 标识符过滤(与扩展 looksTranslatable 同口径,从严)
function isData(s) {
  if (s.length < 2 || s.length > 160) return true;
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

const sorted = Object.keys(candidates).sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1)
  .reduce((o, k) => (o[k] = "", o), {});
const outDir = join(root, "contrib/incoming", lang);
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `candidates-${Object.keys(sorted).length}.json`);
writeFileSync(outPath, JSON.stringify(sorted, null, 2) + "\n");

console.log(`输入 ${terms.length} 条 → 候选 ${Object.keys(sorted).length} 条待译`);
console.log(`  跳过已翻译 ${dropTranslated} · 跳过运行时数据 ${dropData}`);
console.log(`写出:${outPath}`);
console.log(`下一步:补全译文后,移动/合并到 plugin/i18n/domains/,再 node browser-extension/build-dict.mjs`);
