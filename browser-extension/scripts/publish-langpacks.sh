#!/usr/bin/env bash
# 词典发布:主仓库已公开,dict.*.json 直接入库到主仓库,由 jsDelivr 分发。
#
# 分发方案(3.4.32 起):
#   - 词典 URL 钉到发布 tag:https://cdn.jsdelivr.net/gh/vcf-rosetta/vcf-rosetta@v<版本>/browser-extension/dict.<lang>.json
#     (内容不可变,jsDelivr 长期缓存,免 purge、版本与内容永远一致)
#   - 语言目录 langs.json 走 @main 浮动引用(小文件),已装用户据此发现新版本 → 触发重下缓存
#
# 本脚本负责:① 校验「词典变了必须 bump langs.json 里对应语言的 version」;
#            ② 提交词典 + 目录并推送;③ 刷新 jsDelivr 上 @main 的 langs.json(及词典兜底路径)。
# ★ 发布 tag 由发版流程负责:词典 URL 要生效,必须存在与 version 对应的 git tag(v<版本>)。
#   在 tag 打出之前,扩展会自动退回 @main 词典 URL,不影响用户。
#
# 用法:bash browser-extension/scripts/publish-langpacks.sh
# 前提:已用 build-dict.mjs 生成 dict.<lang>.json;对主仓库有推送权限(gh 已登录)。
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
EXT=browser-extension
ls "$EXT"/dict.*.json >/dev/null 2>&1 || { echo "没有 dict.*.json,先跑 node $EXT/build-dict.mjs"; exit 1; }

# ① 版本 bump 守卫:任一 dict.<lang>.json 相对 HEAD 有变化,langs.json 里该语言的 version 必须同时变化,
#    否则已装用户的缓存版本号不变 → 永远收不到这次更新(静默失效,历史踩过的坑)。
node --input-type=module -e '
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
const changed = execSync("git diff --name-only HEAD -- \"browser-extension/dict.*.json\"", {encoding:"utf8"})
  .split("\n").filter(Boolean)
  .map(p => p.match(/dict\.(.+)\.json$/)[1]);
if (!changed.length) { console.log("✓ 版本守卫:词典无变化"); process.exit(0); }
const now = JSON.parse(readFileSync("browser-extension/langs.json","utf8")).languages || {};
let old = {};
try { old = JSON.parse(execSync("git show HEAD:browser-extension/langs.json",{encoding:"utf8"})).languages || {}; } catch {}
const stale = changed.filter(l => old[l] && now[l] && old[l].version === now[l].version);
if (stale.length) {
  console.error("✗ 词典有变化但 langs.json 未 bump version:" + stale.join(", "));
  console.error("  已装用户按 version 判断缓存是否过期 —— 不 bump,这次更新对他们永远不可见。");
  console.error("  请把 browser-extension/langs.json 里上述语言的 version 提升(通常与下一个发布 tag 一致)后重跑。");
  process.exit(1);
}
console.log("✓ 版本守卫通过:" + changed.join(", ") + " 均已 bump");
'

# ② 提交并推送(只针对词典/目录这几条路径,避免卷入维护者其它已暂存改动)
PATHS=("$EXT"/dict.*.json "$EXT"/langs.json)
git add "${PATHS[@]}"
if git diff --cached --quiet -- "${PATHS[@]}"; then
  echo "词典无变化,跳过提交"
else
  git commit -q -m "publish langpacks: $(cd "$EXT" && ls dict.*.json | tr '\n' ' ')" -- "${PATHS[@]}"
  git push -q origin HEAD
  echo "已提交并推送词典到主仓库。"
fi

# ③ 刷新 jsDelivr 的 @main 浮动缓存:langs.json 是版本发现入口(必须刷);
#    词典的 @main 路径仅作 tag 未就绪时的兜底,同样刷一遍。
for f in langs.json $(cd "$EXT" && ls dict.*.json); do
  curl -s --max-time 20 "https://purge.jsdelivr.net/gh/vcf-rosetta/vcf-rosetta@main/$EXT/$f" >/dev/null || true
done
echo "已刷新 jsDelivr(@main)。"
echo "★ 别忘了:发版时打出与 langs.json version 对应的 tag(如 git tag v3.4.32 && git push origin v3.4.32),"
echo "  钉版词典 URL(@v<版本>)才会生效。验证:"
echo "  curl -I https://cdn.jsdelivr.net/gh/vcf-rosetta/vcf-rosetta@main/$EXT/langs.json"
