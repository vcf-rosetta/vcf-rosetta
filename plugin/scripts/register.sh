#!/usr/bin/env bash
# Register the R1 remote plug-in with vCenter using the vSphere Client Plug-in
# Registration Tool (ships with the vSphere Client SDK). Requires Java 17+.
#
# Prereqs:
#   - Plug-in server running over HTTPS (serve.mjs) and reachable from vCenter
#   - TLS cert SAN contains the plug-in server FQDN (gen-cert.sh)
#   - vCenter administrator credentials
#
# Env vars (override as needed):
#   VC_HOST        vCenter FQDN
#   VC_USER        administrator@vsphere.local
#   PLUGIN_URL     https://<plugin-server-fqdn>:8443/plugin.json
#   PLUGIN_KEY     com.vcfrosetta.r1probe   (must match plugin.json key)
#   THUMBPRINT     SHA-256 thumbprint of the plug-in server cert (get-thumbprint.sh)
#   SDK_TOOL       path to the registration tool jar/script from the SDK
set -euo pipefail

: "${VC_HOST:?set VC_HOST}"
: "${VC_USER:?set VC_USER}"
: "${PLUGIN_URL:?set PLUGIN_URL}"
: "${THUMBPRINT:?set THUMBPRINT (from scripts/get-thumbprint.sh)}"
PLUGIN_KEY="${PLUGIN_KEY:-com.vcfrosetta.r1probe}"
SDK_TOOL="${SDK_TOOL:?set SDK_TOOL to the SDK registration tool path}"

# NOTE: exact tool name/flags vary slightly by SDK build — reconcile against
# the SDK's "vSphere Client Plug-in Registration Tool" docs. The required flags
# for a remote plug-in are: -remote, -pluginUrl, -k (key), -c (company),
# -n (name), -v (version), and the server thumbprint.
java -jar "$SDK_TOOL" \
  -action registerPlugin \
  -remote \
  -pluginUrl "$PLUGIN_URL" \
  -k "$PLUGIN_KEY" \
  -n "VCF Rosetta R1 Probe" \
  -v "0.1.0" \
  -c "vcf-rosetta" \
  -vcAddress "$VC_HOST" \
  -username "$VC_USER" \
  -serverThumbprint "$THUMBPRINT"

echo
echo "Registered. Now: log out/in of the vSphere Client, open the plug-in,"
echo "and read the R1 probe verdict (see docs/R1-verification-plan.md)."
