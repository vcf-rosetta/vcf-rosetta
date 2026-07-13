#!/usr/bin/env bash
# One-shot R1 prep: checks deps, auto-detects the host FQDN, generates the TLS
# cert (correct SAN), computes the thumbprint, locates the SDK registration
# tool, and prints copy-paste-ready commands to serve + register.
#
# Usage:
#   cp r1.env.example r1.env   # edit values (or rely on auto-detect)
#   bash prepare.sh
set -euo pipefail

cd "$(dirname "$0")"
HR="------------------------------------------------------------"
ok()   { printf "  \033[32m✓\033[0m %s\n" "$1"; }
warn() { printf "  \033[33m!\033[0m %s\n" "$1"; }
die()  { printf "  \033[31m✗ %s\033[0m\n" "$1"; exit 1; }

# --- load config -----------------------------------------------------------
# 用安全解析器载入 r1.env(不 source/不执行文件),见 scripts/load-env.sh。
. ./scripts/load-env.sh
if [ -f r1.env ]; then load_r1_env ./r1.env; ok "loaded r1.env"; \
else warn "no r1.env (using defaults + auto-detect); cp r1.env.example r1.env to customize"; fi
PORT="${PORT:-8443}"

echo "$HR"; echo "1) Dependency check"
command -v node    >/dev/null || die "node not found (need 18+)"; ok "node $(node -v)"
command -v openssl >/dev/null || die "openssl not found";          ok "openssl present"
command -v curl    >/dev/null || die "curl not found";             ok "curl present"
if java -version >/dev/null 2>&1; then ok "java $(java -version 2>&1 | head -1 | tr -d '"')";
else warn "java runtime not available — needed only for the register step (Java 17+)"; fi

echo "$HR"; echo "2) Resolve plug-in server FQDN"
if [ -z "${PLUGIN_HOST:-}" ]; then
  PLUGIN_HOST="$(hostname -f 2>/dev/null || hostname)"
  warn "PLUGIN_HOST auto-detected: $PLUGIN_HOST"
  warn "  ↳ vCenter MUST be able to resolve+reach this. If it's localhost/short,"
  warn "    set PLUGIN_HOST in r1.env to a vCenter-reachable FQDN."
else
  ok "PLUGIN_HOST=$PLUGIN_HOST"
fi

echo "$HR"; echo "3) TLS cert (SAN=$PLUGIN_HOST)"
if [ -f certs/server.crt ] && openssl x509 -in certs/server.crt -noout -text 2>/dev/null \
     | grep -qF "DNS:$PLUGIN_HOST"; then
  ok "existing certs/server.crt already covers $PLUGIN_HOST"
else
  bash scripts/gen-cert.sh "$PLUGIN_HOST" ./certs >/dev/null
  ok "generated certs/server.crt + server.key"
fi
THUMB="$(openssl x509 -in certs/server.crt -noout -fingerprint -sha256 | sed 's/.*=//')"
ok "SHA-256 thumbprint: $THUMB"

echo "$HR"; echo "4) Locate SDK registration tool"
SDK_TOOL=""
if [ -n "${SDK_DIR:-}" ] && [ -d "$SDK_DIR" ]; then
  SDK_TOOL="$(find "$SDK_DIR" -iname '*.jar' \( -iname '*regist*' -o -iname '*prssetup*' -o -iname '*extension*' \) 2>/dev/null | head -1)"
  [ -n "$SDK_TOOL" ] && ok "found: $SDK_TOOL" \
                     || warn "no obvious registration jar under $SDK_DIR — set SDK_TOOL manually"
else
  warn "SDK_DIR not set/found — download vSphere Client SDK 9.0 and set SDK_DIR in r1.env"
fi

PLUGIN_URL="https://$PLUGIN_HOST:$PORT/plugin.json"

echo "$HR"; echo "READY. Next, run these two commands:"; echo
echo "  # (A) start the HTTPS plug-in server (leave running):"
echo "  node server/serve.mjs --cert ./certs/server.crt --key ./certs/server.key --port $PORT"
echo
echo "  # (B) in another shell, sanity-check vCenter can reach it, then register:"
echo "  curl -kI $PLUGIN_URL        # expect HTTP 200"
echo
echo "  VC_HOST=${VC_HOST:-vcenter.your-domain.com} \\"
echo "  VC_USER=${VC_USER:-administrator@vsphere.local} \\"
echo "  PLUGIN_URL=$PLUGIN_URL \\"
echo "  THUMBPRINT=$THUMB \\"
echo "  SDK_TOOL=${SDK_TOOL:-/path/to/sdk/registration-tool.jar} \\"
echo "  bash scripts/register.sh"
echo
echo "  Then: re-login to vSphere Client → open 'VCF Rosetta(R1 验证)' → read the probe."
echo "  Full verdict matrix: docs/R1-verification-plan.md"
echo "$HR"
