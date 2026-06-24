// 打包浏览器扩展为 zip。
//   node browser-extension/scripts/pack-store.mjs            # 轻量包(商店上架):词典按需从 CDN 下
//   node browser-extension/scripts/pack-store.mjs --offline  # 离线包:把词典内置进包,零联网可用
// 产物:dist/vcf-rosetta-<version>.zip 或 dist/vcf-rosetta-<version>-offline.zip
import { readFileSync, mkdirSync, rmSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const ext = join(here, "..");                       // browser-extension/
const manifest = JSON.parse(readFileSync(join(ext, "manifest.json"), "utf8"));
const ver = manifest.version;
const OFFLINE = process.argv.includes("--offline");

// 上传包白名单:保持轻量 —— 只放代码与清单。词典运行时按需从语言包源下载并本地缓存。
const INCLUDE = [
  "manifest.json",
  "_locales",
  "icons",
  "content",
  "popup",
  "langs.json",
];

// 离线包:把已构建的词典内置进包。扩展取词三级(内置→缓存→CDN)的第一级即命中,全程不联网。
if (OFFLINE) {
  const dicts = readdirSync(ext).filter(f => /^dict\.[a-z]{2}(-[A-Z]{2})?\.json$/.test(f));
  if (!dicts.length) { console.error("离线包需要词典:先跑 node browser-extension/build-dict.mjs"); process.exit(1); }
  INCLUDE.push(...dicts);
  console.log("离线内置词典:", dicts.join(", "));
}

for (const p of INCLUDE) {
  if (!existsSync(join(ext, p))) { console.error(`缺文件:${p}`); process.exit(1); }
}

const dist = join(ext, "dist");
mkdirSync(dist, { recursive: true });
const out = join(dist, `vcf-rosetta-${ver}${OFFLINE ? "-offline" : ""}.zip`);
rmSync(out, { force: true });

// 用系统 zip,保持目录结构;-x 排除任何意外的 dotfile
execFileSync("zip", ["-r", "-X", out, ...INCLUDE, "-x", "*/.DS_Store", "*/node_modules/*"], {
  cwd: ext, stdio: "inherit",
});
console.log(`\n打包完成:${out}`);
if (OFFLINE) console.log("离线安装:chrome://extensions → 开发者模式 → 加载已解压(或拖入 zip)。隔离网/客户现场可用,无需 CDN。");
else console.log("上传到 Chrome 开发者后台 → 上传新项目/新版本。清单见 store/SUBMIT-CHECKLIST.md");
