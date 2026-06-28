// 用「目前最全的 zh-CN」为某个小语种生成待译worklist —— 无需等待现场采集即可开干。
//   node contrib/gap-from-zh.mjs <lang>          # de / it / ko / zh-TW
//   node contrib/gap-from-zh.mjs de --all        # 取整个 zh-CN glossary(含官方TM,约 5 万),默认只取人工策展的 UI 领域词
//
// 取词范围(默认):plugin/i18n/domains/ 下人工策展的 UI 领域词条(H5 对话框 / Aria Ops / SSO 等
//   官方语言包没有、但用户实际会看到的界面),正是各小语种最该补、也最能对照中文补的部分。
// 排除:vmware-official-zh.json(zh 专属官方TM,其它语言另有官方包,不该从中文反推)。
//
// 输出两个文件到 contrib/incoming/<lang>/:
//   from-zh-<n>.json      —— { 英文: "" } 可直接构建的骨架(补译后并入 domains/)
//   from-zh-<n>.ref.json  —— { 英文: "中文参考" } 翻译时对照(中文最全)
// 只输出「目标语言 glossary 里还没有」且「zh-CN 有中文译文可参考」的词条。
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SMALL_LANGS = new Set(["zh-CN", "zh-TW", "de", "it", "ko"]);
const [lang, ...flags] = process.argv.slice(2);
const useAll = flags.includes("--all");
if (!lang || !SMALL_LANGS.has(lang) || lang === "zh-CN") {
  console.error("用法: node contrib/gap-from-zh.mjs <de|it|ko|zh-TW> [--all]");
  process.exit(1);
}
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const i18n = join(root, "plugin/i18n");
const hasCJK = s => /[一-鿿]/.test(s);

const zh = JSON.parse(readFileSync(join(i18n, "glossary.zh-CN.json"), "utf8"));
const target = JSON.parse(readFileSync(join(i18n, `glossary.${lang}.json`), "utf8"));

// 候选英文键集合:--all 用整个 zh-CN;默认用策展 UI 领域词(排除 zh 专属官方TM 与 de 手工 overlay)。
let keySet;
if (useAll) {
  keySet = Object.keys(zh);
} else {
  const dir = join(i18n, "domains");
  const EXCLUDE = new Set(["vmware-official-zh.json", "vcf9-vsphere-client-h5-de.json"]);
  const files = readdirSync(dir).filter(f => f.endsWith(".json") && !EXCLUDE.has(f));
  const s = new Set();
  for (const f of files) {
    const o = JSON.parse(readFileSync(join(dir, f), "utf8"));
    for (const k in o) if (k !== "_note") s.add(k);
  }
  keySet = [...s];
}

// 只保留:目标语言还没有 + zh-CN 有中文可参考。
const missing = keySet
  .filter(k => target[k] === undefined && zh[k] && hasCJK(zh[k]))
  .sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);

if (!missing.length) { console.log(`${lang}: 无缺词(相对 zh-CN ${useAll ? "全量" : "策展UI"}),无需生成。`); process.exit(0); }

const skeleton = missing.reduce((o, k) => (o[k] = "", o), {});
const ref = missing.reduce((o, k) => (o[k] = zh[k], o), {});
const outDir = join(root, "contrib/incoming", lang);
mkdirSync(outDir, { recursive: true });
const base = `from-zh-${missing.length}`;
const skelPath = join(outDir, `${base}.json`);
const refPath = join(outDir, `${base}.ref.json`);
writeFileSync(skelPath, JSON.stringify(skeleton, null, 2) + "\n");
writeFileSync(refPath, JSON.stringify(ref, null, 2) + "\n");

console.log(`${lang}: 相对 zh-CN${useAll ? "全量" : "策展UI"}缺 ${missing.length} 条(均有中文参考)`);
console.log(`写出骨架:${skelPath}`);
console.log(`写出 zh-CN 参考:${refPath}`);
console.log(`下一步:对照 .ref.json 补全 ${base}.json 的译文 → 移入 plugin/i18n/domains/ → node browser-extension/build-dict.mjs`);
