#!/usr/bin/env bash
# 把插件服务装成 systemd 服务:开机自启、崩溃自拉、systemctl 一键管理。
# 用法:
#   bash server/install-service.sh          # 安装并启动(开机自启)
#   bash server/install-service.sh remove    # 卸载
#
# 之后:
#   sudo systemctl restart vcf-rosetta-plugin   # 重启
#   sudo systemctl status  vcf-rosetta-plugin   # 看状态
#   journalctl -u vcf-rosetta-plugin -f          # 看日志
set -euo pipefail

SVC=vcf-rosetta-plugin
UNIT=/etc/systemd/system/$SVC.service
PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"   # -> plugin/

if [ "${1:-}" = "remove" ]; then
  sudo systemctl disable --now "$SVC" 2>/dev/null || true
  sudo rm -f "$UNIT"
  sudo systemctl daemon-reload
  echo "已卸载 $SVC"
  exit 0
fi

[ -f "$PLUGIN_DIR/r1.env" ] && { set -a; . "$PLUGIN_DIR/r1.env"; set +a; }
PORT="${PORT:-8443}"
PLUGIN_HOST="${PLUGIN_HOST:-$(hostname -f 2>/dev/null || hostname)}"
NODE_BIN="$(command -v node)" || { echo "找不到 node"; exit 1; }
SVC_USER="${SUDO_USER:-$USER}"

# 启动前确保证书与插件包就绪(服务进程不交互)
[ -f "$PLUGIN_DIR/certs/server.crt" ] || bash "$PLUGIN_DIR/scripts/gen-cert.sh" "$PLUGIN_HOST" >/dev/null
[ -f "$PLUGIN_DIR/dist/plugin.zip" ] || bash "$PLUGIN_DIR/scripts/build-zip.sh" >/dev/null

echo "安装服务:user=$SVC_USER port=$PORT node=$NODE_BIN dir=$PLUGIN_DIR"
sudo tee "$UNIT" >/dev/null <<EOF
[Unit]
Description=VCF Rosetta plug-in server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$SVC_USER
WorkingDirectory=$PLUGIN_DIR
ExecStart=$NODE_BIN $PLUGIN_DIR/server/serve.mjs --cert $PLUGIN_DIR/certs/server.crt --key $PLUGIN_DIR/certs/server.key --port $PORT
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now "$SVC"
sleep 1
sudo systemctl status "$SVC" --no-pager || true
echo
echo "完成。开机自启已开启。常用:"
echo "  sudo systemctl restart $SVC"
echo "  sudo systemctl status  $SVC"
echo "  journalctl -u $SVC -f"
