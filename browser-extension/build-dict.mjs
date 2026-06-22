// 为每个 plugin/i18n/glossary.<locale>.json 生成 dict.<locale>.json。
// 扩展按用户选择的语言 fetch 对应字典(多语言,一次安装即可切换)。
// 用法: node browser-extension/build-dict.mjs
import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const i18nDir = join(here, "..", "plugin", "i18n");

// 仅匹配真正的 locale 文件:glossary.<lang[-REGION]>.json(如 zh-CN / de / ja),
// 排除 glossary.conflicts.json / glossary.overrides.* 等非语言文件。
const LOCALE_RE = /^glossary\.([a-z]{2}(-[A-Z]{2})?)\.json$/;
const glossaries = readdirSync(i18nDir).filter(f => LOCALE_RE.test(f));
const locales = [];
for (const g of glossaries) {
  const locale = g.match(LOCALE_RE)[1];
  const dict = JSON.parse(readFileSync(join(i18nDir, g), "utf8"));
  const out = join(here, `dict.${locale}.json`);
  writeFileSync(out, JSON.stringify(dict));
  locales.push(locale);
  console.log(`dict.${locale}.json: ${Object.keys(dict).length} terms, ${(statSync(out).size / 1024 / 1024).toFixed(1)}MB`);
}
console.log("locales:", locales.join(", "));
