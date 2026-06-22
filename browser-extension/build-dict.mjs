// 从定稿词表生成 dict.json(扩展按需 fetch,仅在 vCenter 页面加载,避免每站注入)。
// 用法: node browser-extension/build-dict.mjs
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const glossaryPath = join(here, "..", "plugin", "i18n", "glossary.zh-CN.json");
const outPath = join(here, "dict.json");

const dict = JSON.parse(readFileSync(glossaryPath, "utf8"));
writeFileSync(outPath, JSON.stringify(dict));

console.log(`dict.json written: ${Object.keys(dict).length} terms, ${(statSync(outPath).size / 1024 / 1024).toFixed(1)}MB`);
