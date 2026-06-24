// 打包浏览器扩展为 Chrome 应用商店上传用的 zip(只含运行时文件,排除构建脚本/文档)。
//   node browser-extension/scripts/pack-store.mjs
// 产物:browser-extension/dist/vcf-rosetta-<version>.zip
import { readFileSync, mkdirSync, rmSync, createWriteStream, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const ext = join(here, "..");                       // browser-extension/
const manifest = JSON.parse(readFileSync(join(ext, "manifest.json"), "utf8"));
const ver = manifest.version;

// 上传包白名单:保持轻量 —— 只放代码与清单,词典不内置(运行时按需从语言包源下载并本地缓存)。
const INCLUDE = [
  "manifest.json",
  "_locales",
  "icons",
  "content",
  "popup",
  "langs.json",
];
for (const p of INCLUDE) {
  if (!existsSync(join(ext, p))) { console.error(`缺文件:${p}`); process.exit(1); }
}

const dist = join(ext, "dist");
mkdirSync(dist, { recursive: true });
const out = join(dist, `vcf-rosetta-${ver}.zip`);
rmSync(out, { force: true });

// 用系统 zip,保持目录结构;-x 排除任何意外的 dotfile
execFileSync("zip", ["-r", "-X", out, ...INCLUDE, "-x", "*/.DS_Store", "*/node_modules/*"], {
  cwd: ext, stdio: "inherit",
});
console.log(`\n打包完成:${out}`);
console.log("上传到 Chrome 开发者后台 → 上传新项目/新版本。清单见 store/SUBMIT-CHECKLIST.md");
