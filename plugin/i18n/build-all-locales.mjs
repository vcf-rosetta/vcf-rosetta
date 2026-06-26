// 从官方 8.x 语言包批量提取“VCF 9 已放弃的界面语言” -> plugin/i18n/glossary.<tag>.json。
// 是 build-locale.mjs 的批量版,逐一 en<->LOC join。
//   node plugin/i18n/build-all-locales.mjs [/path/to/extracted/langpack]
//
// 【标准·务必遵守】VCF 9 官方仅原生支持 4 种界面语言:English(基础)/ 日本語(ja)/
//   Español(es)/ Français(fr)。这 4 种用户在 VCF 9 里直接切换即可,本扩展【绝不】为其制作翻译包。
//   本扩展只补 VCF 9 已放弃、不再原生提供的语言:zh-CN / zh-TW / de / it / ko。
//   故下方 LOCS 只列“被放弃”的语言,且 NATIVE 集合显式排除 en/ja/es/fr。
// 安全护栏:已存在的 glossary 一律视为权威(已审定/已发布),绝不覆盖,只补缺失的。
import fs from "node:fs"; import path from "node:path"; import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = process.argv[2] || "/tmp/lang";
const here = path.dirname(fileURLToPath(import.meta.url));
const MIN_FILES = 15;   // 配对文件数阈值:滤掉 ru/nl/pl/cs/tr 等只有几条的零散语言

// dir/后缀里的 locale token -> 输出 tag(BCP-47 风格)
const TAG = { zh_CN: "zh-CN", zh_TW: "zh-TW", pt_BR: "pt-BR" };
const tagOf = loc => TAG[loc] || loc;

function walk(d, a) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, a); else a.push(p); } return a; }
const files = walk(ROOT, []);
function read(p) { try { let b = fs.readFileSync(p); if (p.endsWith(".gz")) b = zlib.gunzipSync(b); return b.toString("utf8"); } catch (e) { return null; } }
const deUni = s => s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
function unq(v) { v = v.trim(); if (v.length >= 2 && v[0] === '"' && v[v.length - 1] === '"') v = v.slice(1, -1).replace(/""/g, '"').replace(/\\"/g, '"'); return v; }
function parseKV(t) { const o = {}; if (!t) return o; for (let l of t.split(/\r?\n/)) { l = l.trim(); if (!l || l[0] === "#" || l[0] === "!") continue; const i = l.indexOf("="); if (i < 1) continue; o[l.slice(0, i).trim()] = deUni(unq(l.slice(i + 1))); } return o; }
function parseAny(p) { const t = read(p); if (!t) return {}; if (/\.json(\.gz)?$/.test(p)) { try { const j = JSON.parse(t); const o = {}; for (const k in j) if (typeof j[k] === "string") o[k] = j[k]; return o; } catch (e) { return {}; } } return parseKV(t); }
const isRes = p => /\.(properties|vmsg|json)(\.gz)?$/.test(p);
const PH = /\{\d+\}|%[sd@]|%\d+\$|\$\{|<\w+>/;

// VCF 9 原生支持、本扩展绝不制作的语言(护栏:即便误加入 LOCS 也会被挡)
const NATIVE = new Set(["en", "ja", "es", "fr"]);
// 只提取 VCF 9 已放弃、需本扩展补足的语言。如官方再砍语言,在此追加其 locale token 即可。
const LOCS = ["zh_CN", "zh_TW", "de", "it", "ko"].filter(l => !NATIVE.has(tagOf(l)));

function buildLocale(LOC) {
  const dirTok = LOC, sufTok = "_" + LOC;
  const locFiles = files.filter(p => isRes(p) && (p.includes("/" + dirTok + "/") || p.includes(sufTok + ".")));
  const cands = p => [p.replace("/" + dirTok + "/", "/en/"), p.replace("/" + dirTok + "/", "/en_US/"), p.replace(sufTok + ".", "_en."), p.replace(sufTok + ".", "_en_US."), p.replace(sufTok + ".", ".")];
  const map = {}; let pairs = 0;
  for (const lf of locFiles) { const en = cands(lf).find(c => c !== lf && fs.existsSync(c)); if (!en) continue; pairs++; const ez = parseAny(en), lz = parseAny(lf); for (const k in lz) { const e = ez[k], z = lz[k]; if (!e || !z || e === z || !/[A-Za-z]/.test(e)) continue; if (map[e] === undefined) map[e] = z; } }
  if (pairs < MIN_FILES) return { pairs, skipped: "too-few-files" };
  const out = {}; for (const e in map) { if (e.length < 2 || e.length > 400 || PH.test(e) || !/[A-Za-z]/.test(e)) continue; out[e] = map[e]; }
  const sorted = Object.keys(out).sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1).reduce((o, k) => { o[k] = out[k]; return o; }, {});
  const tag = tagOf(LOC);
  const outPath = path.join(here, `glossary.${tag}.json`);
  // 标准:只补“被放弃/缺失”的语言。已存在的 glossary 一律视为权威(已审定/已发布),绝不覆盖。
  if (fs.existsSync(outPath)) return { pairs, tag, terms: Object.keys(sorted).length, skipped: "exists(authoritative)" };
  fs.writeFileSync(outPath, JSON.stringify(sorted, null, 2) + "\n");
  return { pairs, tag, terms: Object.keys(sorted).length, wrote: true };
}

console.log(`pack: ${ROOT}`);
for (const LOC of LOCS) {
  const r = buildLocale(LOC);
  if (r.skipped === "too-few-files") continue;        // 安静跳过零散语言
  const status = r.wrote ? "WROTE" : `skip(${r.skipped})`;
  console.log(`${tagOf(LOC).padEnd(6)} ${String(r.pairs).padStart(3)} pairs  ${String(r.terms ?? "-").padStart(6)} terms  ${status}`);
}
