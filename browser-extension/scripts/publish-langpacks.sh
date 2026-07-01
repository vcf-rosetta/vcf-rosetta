#!/usr/bin/env bash
# 词典发布:主仓库已公开,dict.*.json 直接入库到主仓库,由 jsDelivr 从主仓库分发:
#   https://cdn.jsdelivr.net/gh/vcf-rosetta/vcf-rosetta@main/browser-extension/dict.<lang>.json
#
# 本脚本只负责:提交最新词典 + 刷新 jsDelivr 的 @main 浮动缓存。
#   bash browser-extension/scripts/publish-langpacks.sh
#
# 前提:已用 build-dict.mjs 生成 dict.<lang>.json;对主仓库有推送权限(gh 已登录)。
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
EXT=browser-extension
ls "$EXT"/dict.*.json >/dev/null 2>&1 || { echo "没有 dict.*.json,先跑 node $EXT/build-dict.mjs"; exit 1; }

PATHS=("$EXT"/dict.*.json "$EXT"/langs.json)
git add "${PATHS[@]}"
# 只针对词典/目录这几条路径判断变化与提交,避免把维护者其它已暂存的改动一起卷进来
if git diff --cached --quiet -- "${PATHS[@]}"; then
  echo "词典无变化,跳过提交"
else
  git commit -q -m "publish langpacks: $(cd "$EXT" && ls dict.*.json | tr '\n' ' ')" -- "${PATHS[@]}"
  git push -q origin HEAD
  echo "已提交并推送词典到主仓库。"
fi

# 刷新 jsDelivr 缓存(@main 是浮动引用,旧内容可能仍被缓存)
for f in langs.json $(cd "$EXT" && ls dict.*.json); do
  curl -s --max-time 20 "https://purge.jsdelivr.net/gh/vcf-rosetta/vcf-rosetta@main/$EXT/$f" >/dev/null || true
done
echo "已刷新 jsDelivr。验证:"
echo "  curl -I https://cdn.jsdelivr.net/gh/vcf-rosetta/vcf-rosetta@main/$EXT/dict.zh-CN.json"
