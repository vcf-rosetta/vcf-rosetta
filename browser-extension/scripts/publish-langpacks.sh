#!/usr/bin/env bash
# 把构建好的词典发布到 `langpacks` 分支,供 jsDelivr 按需分发(扩展从
# https://cdn.jsdelivr.net/gh/<owner>/<repo>@langpacks/dict.<lang>.json 下载)。
# 这样 main 分支不被数 MB 词典撑大,扩展包也保持轻量。
#
#   bash browser-extension/scripts/publish-langpacks.sh
#
# 前提:已在 browser-extension/ 下用 build-dict.mjs 生成了 dict.<lang>.json。
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
EXT=browser-extension
ls "$EXT"/dict.*.json >/dev/null 2>&1 || { echo "没有 dict.*.json,先跑 node $EXT/build-dict.mjs"; exit 1; }

TMP="$(mktemp -d)"
cp "$EXT"/dict.*.json "$EXT"/langs.json "$TMP"/
CUR="$(git rev-parse --abbrev-ref HEAD)"

# 用 worktree 操作 langpacks 分支,避免污染当前工作区
git fetch origin langpacks 2>/dev/null || true
if git show-ref --verify --quiet refs/heads/langpacks; then
  git worktree add /tmp/lp langpacks
else
  git worktree add --orphan -b langpacks /tmp/lp 2>/dev/null || { git worktree add -B langpacks /tmp/lp origin/langpacks; }
fi
rm -f /tmp/lp/dict.*.json /tmp/lp/langs.json 2>/dev/null || true
cp "$TMP"/* /tmp/lp/
( cd /tmp/lp && git add -A && git commit -m "chore(langpacks): publish dicts $(ls dict.*.json | tr '\n' ' ')" && git push -u origin langpacks )
git worktree remove /tmp/lp --force
rm -rf "$TMP"
echo "已发布 langpacks。jsDelivr 几分钟后生效(强刷:https://purge.jsdelivr.net/gh/<owner>/<repo>@langpacks/dict.<lang>.json)"
