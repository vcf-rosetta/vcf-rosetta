#!/usr/bin/env bash
# 把构建好的词典发布到**公开数据仓库** vcf-rosetta/langpacks(主仓库保持私有),
# 供 jsDelivr 按需分发:
#   https://cdn.jsdelivr.net/gh/vcf-rosetta/langpacks@main/dict.<lang>.json
#
#   bash browser-extension/scripts/publish-langpacks.sh
#
# 前提:已用 build-dict.mjs 生成 dict.<lang>.json;有 langpacks 仓库的推送权限(gh 已登录)。
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
EXT=browser-extension
DATA_REPO="https://github.com/vcf-rosetta/langpacks.git"
ls "$EXT"/dict.*.json >/dev/null 2>&1 || { echo "没有 dict.*.json,先跑 node $EXT/build-dict.mjs"; exit 1; }

TMP="$(mktemp -d)"
git clone --depth 1 "$DATA_REPO" "$TMP" 2>/dev/null
cp "$EXT"/dict.*.json "$EXT"/langs.json "$TMP"/
( cd "$TMP"
  git add -A
  if git diff --cached --quiet; then echo "langpacks 无变化,跳过"; exit 0; fi
  git commit -q -m "publish langpacks: $(ls dict.*.json | tr '\n' ' ')$(date -u +%Y-%m-%d 2>/dev/null || echo)"
  git push -q origin HEAD
)
rm -rf "$TMP"

# 刷新 jsDelivr 缓存(@main 是浮动引用,旧内容可能仍被缓存)
for f in langs.json $(cd "$EXT" && ls dict.*.json); do
  curl -s --max-time 20 "https://purge.jsdelivr.net/gh/vcf-rosetta/langpacks@main/$f" >/dev/null || true
done
echo "已发布到 vcf-rosetta/langpacks 并刷新 jsDelivr。验证:"
echo "  curl -I https://cdn.jsdelivr.net/gh/vcf-rosetta/langpacks@main/dict.zh-CN.json"
