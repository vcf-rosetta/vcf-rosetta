#!/usr/bin/env bash
# Generate a self-signed TLS cert for the R1 plug-in server.
# CRITICAL: subjectAltName MUST contain the FQDN the plug-in server is reached
# at, or vCenter will reject the plug-in (RFC 2818). Pass that FQDN as $1.
set -euo pipefail

FQDN="${1:?usage: gen-cert.sh <plugin-server-fqdn> [out-dir]}"
OUT="${2:-./certs}"
mkdir -p "$OUT"

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "$OUT/server.key" \
  -out "$OUT/server.crt" \
  -days 365 \
  -subj "/CN=$FQDN" \
  -addext "subjectAltName=DNS:$FQDN"

echo "Wrote $OUT/server.crt and $OUT/server.key (SAN=DNS:$FQDN)"
echo "SHA-256 thumbprint (colon-separated, used at registration):"
openssl x509 -in "$OUT/server.crt" -noout -fingerprint -sha256 | sed 's/.*=//'
