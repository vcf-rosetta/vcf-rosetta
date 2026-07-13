// 为每个 plugin/i18n/glossary.<locale>.json 生成 dict.<locale>.json。
// 扩展按用户选择的语言 fetch 对应字典(多语言,一次安装即可切换)。
// 同时把每个 dict 的 SHA-256 写回 langs.json —— 扩展下载语言包后据此校验完整性
// (防 CDN/仓库被投毒时把篡改过的译文喂进 vCenter 控制台)。
// 用法: node browser-extension/build-dict.mjs
import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const i18nDir = join(here, "..", "plugin", "i18n");

// 仅匹配真正的 locale 文件:glossary.<lang[-REGION]>.json(如 zh-CN / de / ja),
// 排除 glossary.conflicts.json / glossary.overrides.* 等非语言文件。
const LOCALE_RE = /^glossary\.([a-z]{2}(-[A-Z]{2})?)\.json$/;
const glossaries = readdirSync(i18nDir).filter(f => LOCALE_RE.test(f));
const locales = [];
const hashes = {};
for (const g of glossaries) {
  const locale = g.match(LOCALE_RE)[1];
  const dict = JSON.parse(readFileSync(join(i18nDir, g), "utf8"));
  const out = join(here, `dict.${locale}.json`);
  const bytes = JSON.stringify(dict);   // 与写盘、与扩展 fetch 到的字节完全一致 → 哈希可复现
  writeFileSync(out, bytes);
  hashes[locale] = createHash("sha256").update(bytes).digest("hex");
  locales.push(locale);
  console.log(`dict.${locale}.json: ${Object.keys(dict).length} terms, ${(statSync(out).size / 1024 / 1024).toFixed(1)}MB, sha256=${hashes[locale].slice(0, 12)}…`);
}

// 把哈希写回 langs.json(仅更新已登记语言的 sha256,不动 version/name 等人工维护字段)。
const langsPath = join(here, "langs.json");
const langs = JSON.parse(readFileSync(langsPath, "utf8"));
let changed = false;
for (const [code, meta] of Object.entries(langs.languages || {})) {
  if (hashes[code] && meta.sha256 !== hashes[code]) { meta.sha256 = hashes[code]; changed = true; }
  else if (hashes[code] && !meta.sha256) { meta.sha256 = hashes[code]; changed = true; }
}
if (changed) { writeFileSync(langsPath, JSON.stringify(langs, null, 2) + "\n"); console.log("langs.json: sha256 已更新"); }
console.log("locales:", locales.join(", "));
