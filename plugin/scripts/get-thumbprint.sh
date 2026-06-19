#!/usr/bin/env bash
# Fetch the live SHA-256 thumbprint of the plug-in server's TLS cert, formatted
# as colon-separated hex pairs the way vCenter expects it at registration.
# Use this against the running serve.mjs to confirm the thumbprint you register
# matches what is actually served (mismatch => plug-in silently won't appear).
set -euo pipefail

HOST="${1:?usage: get-thumbprint.sh <plugin-server-fqdn> [port]}"
PORT="${2:-8443}"

echo | openssl s_client -connect "$HOST:$PORT" -servername "$HOST" 2>/dev/null \
  | openssl x509 -noout -fingerprint -sha256 \
  | sed 's/.*=//'
