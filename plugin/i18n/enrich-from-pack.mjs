// 从一个解压后的官方语言包【增量】丰富已有 glossary —— 只“加新键”,绝不覆盖已有译法。
//   node plugin/i18n/enrich-from-pack.mjs /path/to/extracted/pack
// 与 build-all-locales.mjs 的区别:那个只“创建缺失语言文件”;本脚本对【已存在】的 glossary
// 追加包内新发现的 en->loc 词条(如 vsphere-l10n.tgz 里的 VsanUi / VumUi / vLCM / appliance UI)。
//
// 【标准】只动 VCF 9 已放弃、需补足的语言:zh-CN/zh-TW/de/it/ko;NATIVE(en/ja/es/fr)永不处理。
// 已有键一律保留(zh-CN 的审定译法、Build→构建、域补词等不受影响)。见 build-all-locales.mjs 头注。
import fs from "node:fs"; import path from "node:path"; import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = process.argv[2] || "/tmp/lang";
const here = path.dirname(fileURLToPath(import.meta.url));
const NATIVE = new Set(["en", "ja", "es", "fr"]);
const TAG = { zh_CN: "zh-CN", zh_TW: "zh-TW", pt_BR: "pt-BR" };
const tagOf = l => TAG[l] || l;
const LOCS = ["zh_CN", "zh_TW", "de", "it", "ko"].filter(l => !NATIVE.has(tagOf(l)));

function walk(d, a) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, a); else a.push(p); } return a; }
const files = walk(ROOT, []);
function read(p) { try { let b = fs.readFileSync(p); if (p.endsWith(".gz")) b = zlib.gunzipSync(b); return b.toString("utf8"); } catch (e) { return null; } }
const deUni = s => s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
function unq(v) { v = v.trim(); if (v.length >= 2 && v[0] === '"' && v[v.length - 1] === '"') v = v.slice(1, -1).replace(/""/g, '"').replace(/\\"/g, '"'); return v; }
function parseKV(t) { const o = {}; if (!t) return o; for (let l of t.split(/\r?\n/)) { l = l.trim(); if (!l || l[0] === "#" || l[0] === "!") continue; const i = l.indexOf("="); if (i < 1) continue; o[l.slice(0, i).trim()] = deUni(unq(l.slice(i + 1))); } return o; }
function parseAny(p) { const t = read(p); if (!t) return {}; if (/\.json(\.gz)?$/.test(p)) { try { const j = JSON.parse(t); const o = {}; for (const k in j) if (typeof j[k] === "string") o[k] = j[k]; return o; } catch (e) { return {}; } } return parseKV(t); }
const isRes = p => /\.(properties|vmsg|json)(\.gz)?$/.test(p);
const PH = /\{\d+\}|%[sd@]|%\d+\$|\$\{|<\w+>/;

function pairsFor(LOC) {
  const dirTok = LOC, sufTok = "_" + LOC;
  const locFiles = files.filter(p => isRes(p) && (p.includes("/" + dirTok + "/") || p.includes(sufTok + ".")));
  const cands = p => [p.replace("/" + dirTok + "/", "/en/"), p.replace("/" + dirTok + "/", "/en_US/"), p.replace(sufTok + ".", "_en."), p.replace(sufTok + ".", "_en_US."), p.replace(sufTok + ".", ".")];
  const map = {};
  for (const lf of locFiles) { const en = cands(lf).find(c => c !== lf && fs.existsSync(c)); if (!en) continue; const ez = parseAny(en), lz = parseAny(lf); for (const k in lz) { const e = ez[k], z = lz[k]; if (!e || !z || e === z || !/[A-Za-z]/.test(e)) continue; if (map[e] === undefined) map[e] = z; } }
  return map;
}

console.log(`pack: ${ROOT}`);
for (const LOC of LOCS) {
  const tag = tagOf(LOC);
  const gp = path.join(here, `glossary.${tag}.json`);
  if (!fs.existsSync(gp)) { console.log(`${tag.padEnd(6)} glossary 不存在,跳过(用 build-all-locales 先建)`); continue; }
  const g = JSON.parse(fs.readFileSync(gp, "utf8"));
  const map = pairsFor(LOC);
  let added = 0;
  for (const e in map) {
    if (e.length < 2 || e.length > 400 || PH.test(e) || !/[A-Za-z]/.test(e)) continue;
    if (g[e] !== undefined) continue;          // 已有键保留,不覆盖
    g[e] = map[e]; added++;
  }
  if (!added) { console.log(`${tag.padEnd(6)} +0(无新词)`); continue; }
  const sorted = Object.keys(g).sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1).reduce((o, k) => { o[k] = g[k]; return o; }, {});
  fs.writeFileSync(gp, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`${tag.padEnd(6)} +${added} -> ${Object.keys(sorted).length} terms`);
}
