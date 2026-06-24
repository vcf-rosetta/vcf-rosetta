#!/usr/bin/env bash
# vcf-rosetta 插件统一管理 CLI(Linux / macOS)。
# 把原先分散的 prepare/serve/gen-cert/build-zip/register/install-service 收敛成一条命令。
# 全程非交互:所有输入走 r1.env(没有就用自动探测的默认值)。
#
# 用法:
#   bash rosetta.sh install     # 一键:查依赖→证书→打包→装 systemd 服务→开机自启并启动
#   bash rosetta.sh start       # 前台启动(调试用,Ctrl-C 退出)
#   bash rosetta.sh restart     # 重启后台服务
#   bash rosetta.sh stop        # 停止后台服务
#   bash rosetta.sh status      # 看服务状态 + 本机自测 200
#   bash rosetta.sh update      # 拉代码→重建词典/插件包→重启服务(发版更新)
#   bash rosetta.sh register    # 向 vCenter 注册插件(需 Java + SDK_TOOL)
#   bash rosetta.sh uninstall   # 卸载 systemd 服务(不删代码)
#
# 配置(可选,放在 plugin/r1.env):
#   PLUGIN_HOST=dc.vclass.local   # vCenter 能解析+访问到的地址(域名或 IP)。缺省=hostname -f
#   PORT=8443
#   VC_HOST / VC_USER / SDK_TOOL  # 仅 register 需要
set -euo pipefail
cd "$(dirname "$0")"   # -> plugin/

SVC=vcf-rosetta-plugin
HR="------------------------------------------------------------"
ok()   { printf "  \033[32m✓\033[0m %s\n" "$1"; }
warn() { printf "  \033[33m!\033[0m %s\n" "$1"; }
die()  { printf "  \033[31m✗ %s\033[0m\n" "$1" >&2; exit 1; }

[ -f r1.env ] && { set -a; . ./r1.env; set +a; }
PORT="${PORT:-8443}"
PLUGIN_HOST="${PLUGIN_HOST:-$(hostname -f 2>/dev/null || hostname)}"
HAS_SYSTEMD=0; command -v systemctl >/dev/null 2>&1 && [ -d /run/systemd/system ] && HAS_SYSTEMD=1

# ── 公共步骤 ───────────────────────────────────────────────
ensure_cert() {
  if [ -f certs/server.crt ] && openssl x509 -in certs/server.crt -noout -text 2>/dev/null | grep -qE "DNS:$PLUGIN_HOST|IP Address:$PLUGIN_HOST"; then
    ok "证书已覆盖 $PLUGIN_HOST"
  else
    bash scripts/gen-cert.sh "$PLUGIN_HOST" ./certs >/dev/null
    ok "已生成证书 (SAN=$PLUGIN_HOST)"
  fi
}
ensure_zip() {
  bash scripts/build-zip.sh >/dev/null && ok "已构建 dist/plugin.zip"
}
check_deps() {
  command -v node    >/dev/null || die "缺 node(需 18+)";  ok "node $(node -v)"
  command -v openssl >/dev/null || die "缺 openssl";        ok "openssl 就绪"
  command -v zip     >/dev/null || die "缺 zip";            ok "zip 就绪"
}
serve_cmd() { echo node server/serve.mjs --cert ./certs/server.crt --key ./certs/server.key --port "$PORT"; }

# ── 子命令 ─────────────────────────────────────────────────
cmd_start() {        # 前台,调试用
  check_deps; ensure_cert; ensure_zip
  echo "$HR"; ok "前台启动:https://$PLUGIN_HOST:$PORT/plugin.json  (Ctrl-C 退出)"
  exec $(serve_cmd)
}

cmd_install() {
  echo "$HR"; echo "1) 依赖"; check_deps
  echo "$HR"; echo "2) 证书 (SAN=$PLUGIN_HOST)"; ensure_cert
  echo "$HR"; echo "3) 插件包"; ensure_zip
  echo "$HR"; echo "4) 后台服务"
  if [ "$HAS_SYSTEMD" = 1 ]; then
    NODE_BIN="$(command -v node)"; SVC_USER="${SUDO_USER:-$USER}"; DIR="$(pwd)"
    sudo tee "/etc/systemd/system/$SVC.service" >/dev/null <<EOF
[Unit]
Description=VCF Rosetta plug-in server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$SVC_USER
WorkingDirectory=$DIR
ExecStart=$NODE_BIN $DIR/server/serve.mjs --cert $DIR/certs/server.crt --key $DIR/certs/server.key --port $PORT
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
    sudo systemctl daemon-reload
    sudo systemctl enable --now "$SVC"
    sleep 1; ok "systemd 服务已启用并自启"
    cmd_status || true
  else
    warn "未检测到 systemd。用 nohup 后台跑(无开机自启):"
    echo "    nohup $(serve_cmd) >/tmp/$SVC.log 2>&1 &"
    warn "macOS 开机自启请改用 launchd,或直接 'rosetta.sh start' 前台跑。"
  fi
  echo "$HR"; ok "安装完成。下一步:bash rosetta.sh register(向 vCenter 注册)"
}

cmd_restart() {
  if [ "$HAS_SYSTEMD" = 1 ]; then sudo systemctl restart "$SVC"; sleep 1; ok "已重启"; cmd_status || true
  else die "无 systemd:请 stop 后重新 start,或用你的进程管理器重启"; fi
}
cmd_stop() {
  [ "$HAS_SYSTEMD" = 1 ] && { sudo systemctl stop "$SVC"; ok "已停止"; } || pkill -f "server/serve.mjs" || true
}
cmd_status() {
  if [ "$HAS_SYSTEMD" = 1 ]; then sudo systemctl status "$SVC" --no-pager | head -5 || true; fi
  if curl -ksI --noproxy '*' --max-time 5 "https://localhost:$PORT/plugin.json" 2>/dev/null | grep -q "200"; then
    ok "本机自测 https://localhost:$PORT/plugin.json → 200"
  else
    warn "本机自测未返回 200(服务可能未起,或端口/证书问题)"
  fi
}

cmd_update() {       # 发版更新:拉代码→重建→重启
  echo "$HR"; echo "拉取最新代码"
  git pull --ff-only && ok "git 已更新" || warn "git pull 跳过(非 git 或有本地改动)"
  echo "$HR"; echo "重建扩展词典 + 插件包"
  node ../browser-extension/build-dict.mjs >/dev/null 2>&1 && ok "dict 已重建" || warn "dict 重建跳过"
  ensure_zip
  echo "$HR"; echo "重启服务"
  if [ "$HAS_SYSTEMD" = 1 ]; then cmd_restart; else warn "无 systemd:请手动重启前台/后台进程"; fi
  ok "更新完成(插件包已换新;浏览器扩展请在 chrome://extensions 点『重新加载』或等商店自动更新)"
}

cmd_register() {
  : "${VC_HOST:?在 r1.env 设 VC_HOST}"; : "${VC_USER:?在 r1.env 设 VC_USER}"
  : "${SDK_TOOL:?在 r1.env 设 SDK_TOOL(vSphere Client SDK 注册工具 jar)}"
  command -v java >/dev/null || die "缺 java(注册需 Java 17+)"
  THUMB="$(openssl x509 -in certs/server.crt -noout -fingerprint -sha256 | sed 's/.*=//')"
  ok "thumbprint: $THUMB"
  VC_HOST="$VC_HOST" VC_USER="$VC_USER" \
    PLUGIN_URL="https://$PLUGIN_HOST:$PORT/plugin.json" \
    THUMBPRINT="$THUMB" SDK_TOOL="$SDK_TOOL" \
    bash scripts/register.sh
}

cmd_uninstall() {
  if [ "$HAS_SYSTEMD" = 1 ]; then
    sudo systemctl disable --now "$SVC" 2>/dev/null || true
    sudo rm -f "/etc/systemd/system/$SVC.service"; sudo systemctl daemon-reload
    ok "已卸载 systemd 服务(代码与证书保留)"
  else warn "无 systemd:手动停掉进程即可"; fi
}

case "${1:-}" in
  install)   cmd_install   ;;
  start)     cmd_start     ;;
  restart)   cmd_restart   ;;
  stop)      cmd_stop      ;;
  status)    cmd_status    ;;
  update)    cmd_update    ;;
  register)  cmd_register  ;;
  uninstall) cmd_uninstall ;;
  *) sed -n '2,25p' "$0"; exit 1 ;;
esac
