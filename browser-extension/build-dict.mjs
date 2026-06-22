// Regenerate dict.js from the finalized glossary.
// Usage: node browser-extension/build-dict.mjs
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const glossaryPath = join(here, "..", "plugin", "i18n", "glossary.zh-CN.json");
const outPath = join(here, "dict.js");

const dict = JSON.parse(readFileSync(glossaryPath, "utf8"));
const header =
  "// 自动生成,勿手改。源:plugin/i18n/glossary.zh-CN.json。重新生成:node browser-extension/build-dict.mjs\n";
writeFileSync(outPath, header + "window.__vcDict = " + JSON.stringify(dict) + ";\n");

console.log(`dict.js written: ${Object.keys(dict).length} terms, ${(statSync(outPath).size / 1024).toFixed(0)}KB`);
