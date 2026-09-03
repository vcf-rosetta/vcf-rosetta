// 把 compare-nearby 的「实质不同」再分层。
//   node contrib/classify-diff.mjs <lang>
//
// 为什么要分:31.9% 的意语实质差异听着像质量问题,但抽样后发现主因是
// 【连接词风格】—— 我写 `cluster di datastore`,官方写 `cluster datastore`;
// 我写 `Configurazione della sicurezza`,官方写 `Configurazione sicurezza`。
// 两种都是合法意大利语,差的是 house style,不是错。这类必须与「术语选择」
// 和「真错」分开,否则错误率会被虚报好几倍。
//
// 分两层(机器只能做到这一层,再往下要人看):
//   S1 功能词/屈折差异 —— 去掉冠词/介词/助词/动词词尾后两边相同
//   S2 内容词不同     —— 实词就是不一样,需人工判「术语选择」还是「真错」
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FUNC = {
  // 冠词 + 介词 + 冠词缩合形(dello/della/dei/degli/nelle/sul...)
  it: /\b(il|lo|la|i|gli|le|un|uno|una|di|a|da|in|con|su|per|tra|fra|del|dello|della|dei|degli|delle|dell|al|allo|alla|ai|agli|alle|all|dal|dallo|dalla|dai|dagli|dalle|dall|nel|nello|nella|nei|negli|nelle|nell|sul|sullo|sulla|sui|sugli|sulle|sull|l|d|e|ed)\b/g,
  // 冠词 + 介词。德语还要吃掉不定式/名词化的常见词尾差异
  de: /\b(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines|und|oder|von|vom|zu|zum|zur|für|mit|auf|in|im|an|am|als|bei|beim|nach|über|unter|aus)\b/g,
  // 韩语助词(조사)
  ko: /(으로|에서|에게|에|을|를|이|가|은|는|의|와|과|도|만|까지|부터|보다)(?=\s|$)/g,
};
// 动词形归一:意语祈使/不定式(Aggiungi/Aggiungere)、德语不定式词尾、韩语语尾
const VERBFORM = {
  it: s => s.replace(/\b(\w+?)(are|ere|ire|arlo|a|e|i|o)\b/g, "$1"),
  de: s => s.replace(/\b(\w+?)(en|ung|ungen|e|er|es|em|n|s)\b/g, "$1"),
  ko: s => s.replace(/(하십시오|합니다|하기|하는|되는|됨|함|다)(?=\s|$)/g, ""),
};

const [lang] = process.argv.slice(2);
if (!lang || !FUNC[lang]) { console.error("用法: node contrib/classify-diff.mjs <de|it|ko>"); process.exit(2); }
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tsv = readFileSync(join(root, "contrib/incoming", lang, "DIFF-substantive.tsv"), "utf8").trim().split("\n").slice(1);

const base = s => s.toLowerCase()
  .replace(/[.…:;,!?()[\]{}"'`’\-_/\\]+/g, " ")
  .replace(/\s+/g, " ").trim();
const skel = s => VERBFORM[lang](base(s).replace(FUNC[lang], " ")).replace(/\s+/g, " ").trim();

const s1 = [], s2 = [];
for (const line of tsv) {
  const [file, en, mine, refEn, ref] = line.split("\t");
  if (!mine || !ref) continue;
  (skel(mine) === skel(ref) ? s1 : s2).push({ file, en, mine, refEn, ref });
}
const n = s1.length + s2.length;
console.log(`${lang}: 实质不同 ${n} 条`);
console.log(`  S1 功能词/屈折差异(非错) ${s1.length}  ${(100*s1.length/n).toFixed(1)}%`);
console.log(`  S2 内容词不同(待人工判)  ${s2.length}  ${(100*s2.length/n).toFixed(1)}%`);
console.log(`\nS2 全部:`);
for (const r of s2) console.log(`  ${r.en}\n     我 ${r.mine}\n     库 ${r.ref}`);
