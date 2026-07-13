#!/usr/bin/env bash
# 一键启动插件服务(前台):自动读配置、缺证书就生成、缺包就构建,然后跑 HTTPS 服务。
#   bash serve.sh
# 配置来自 r1.env(可选):PLUGIN_HOST / PORT。
set -euo pipefail
cd "$(dirname "$0")"   # -> plugin/

# 安全解析 r1.env(不 source/不执行文件),见 scripts/load-env.sh。
. ./scripts/load-env.sh
load_r1_env ./r1.env
PORT="${PORT:-8443}"
PLUGIN_HOST="${PLUGIN_HOST:-$(hostname -f 2>/dev/null || hostname)}"

# 缺证书 -> 按 PLUGIN_HOST 生成(SAN 自动匹配)
if [ ! -f certs/server.crt ] || [ ! -f certs/server.key ]; then
  echo "[serve] 生成证书 (SAN=$PLUGIN_HOST)…"
  bash scripts/gen-cert.sh "$PLUGIN_HOST" >/dev/null
fi

# 缺插件包 -> 构建
if [ ! -f dist/plugin.zip ]; then
  echo "[serve] 构建 plugin.zip…"
  bash scripts/build-zip.sh >/dev/null
fi

echo "[serve] 启动:https://$PLUGIN_HOST:$PORT/plugin.zip"
exec node server/serve.mjs --cert ./certs/server.crt --key ./certs/server.key --port "$PORT"
