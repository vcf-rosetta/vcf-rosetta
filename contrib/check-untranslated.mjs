// A8(译文=英文)里哪些是【可证明的漏译】。
//   node contrib/check-untranslated.mjs <lang>
//
// A8 只能数「译文与英文相同」,不能判断该不该相同 —— 专名本就该相同。
// 我此前把 1202 条德语 A8 一律当成专名放过,但抽样发现 `install`/`MONITORING`/`POLICY`
// 这类普通词也在里面,是真漏译。
//
// 判据(地面实况,不靠猜):该英文串在权威 glossary 里存在【近重复键】,
// 且官方给了与英文不同的译文 —— 说明这个词官方是翻的,我没翻,就是漏。
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [lang] = process.argv.slice(2);
if (!lang) { console.error("用法: node contrib/check-untranslated.mjs <de|it|ko>"); process.exit(2); }
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const gloss = JSON.parse(readFileSync(join(root, "plugin/i18n", `glossary.${lang}.json`), "utf8"));
const dir = join(root, "contrib/incoming", lang, "batches");

const normKey = s => s.toLowerCase().replace(/[.…:;,!?()[\]{}"'`’\-_/\\]+/g, " ").replace(/\s+/g, " ").trim();
// 官方【翻了】的近重复键:值与英文不同才算证据。
// 注意必须【忽略大小写与标点】比对 —— 否则 `vCenter server -> vCenter Server`、
// `host -> Host` 这种「只是改了大小写」会被当成译文,实测 71 条里大半是这种假阳性。
const sameWord = (a, b) => a.toLowerCase().replace(/[^a-z0-9]+/g, "") === b.toLowerCase().replace(/[^a-z0-9]+/g, "");
const officialTranslated = new Map();
for (const [en, tr] of Object.entries(gloss)) {
  if (typeof tr !== "string" || !tr.trim() || sameWord(tr, en)) continue;
  const k = normKey(en);
  if (!officialTranslated.has(k)) officialTranslated.set(k, { en, tr });
}

const misses = [];
let a8 = 0;
for (const f of readdirSync(dir).filter(f => /^(long|short)-\d+\.json$/.test(f)).sort()) {
  for (const [en, tr] of Object.entries(JSON.parse(readFileSync(join(dir, f), "utf8")))) {
    if (typeof tr !== "string" || tr !== en) continue;
    a8++;
    const o = officialTranslated.get(normKey(en));
    if (o) misses.push({ file: f.replace(/\.json$/, ""), en, ref: o.tr, refEn: o.en });
  }
}
console.log(`${lang}: A8(译文=英文) ${a8} 条,其中【官方翻了而我没翻】 ${misses.length} 条 —— 可证明的漏译`);
for (const m of misses) console.log(`  [${m.file}] ${m.en}\n       官方(${m.refEn}) -> ${m.ref}`);
