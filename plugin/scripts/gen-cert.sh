#!/usr/bin/env bash
# Generate a self-signed TLS cert for the R1 plug-in server.
# CRITICAL: subjectAltName MUST contain the FQDN the plug-in server is reached
# at, or vCenter will reject the plug-in (RFC 2818). Pass that FQDN as $1.
set -euo pipefail

HOST="${1:?usage: gen-cert.sh <plugin-server-fqdn-or-ip> [out-dir]}"
OUT="${2:-./certs}"
mkdir -p "$OUT"

# Build SAN: vCenter reaches the plug-in server by this name/IP, so it must be
# in the cert's subjectAltName. Auto-detect IP vs DNS, and always add localhost
# so on-box self-tests work too.
if [[ "$HOST" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  SAN="IP:$HOST,DNS:localhost,IP:127.0.0.1"
else
  SAN="DNS:$HOST,DNS:localhost,IP:127.0.0.1"
fi

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "$OUT/server.key" \
  -out "$OUT/server.crt" \
  -days 365 \
  -subj "/CN=$HOST" \
  -addext "subjectAltName=$SAN"

echo "Wrote $OUT/server.crt and $OUT/server.key (SAN=$SAN)"
echo "SHA-256 thumbprint (colon-separated, used at registration):"
openssl x509 -in "$OUT/server.crt" -noout -fingerprint -sha256 | sed 's/.*=//'
