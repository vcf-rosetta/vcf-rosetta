#!/usr/bin/env bash
# Build the remote plug-in package dist/plugin.zip that vCenter downloads.
# vSphere 9.x remote plugins are delivered as a .zip whose root contains the
# plugin.json manifest plus the UI assets it references.
set -euo pipefail

cd "$(dirname "$0")/.."        # -> plugin/
rm -rf dist build-tmp
mkdir -p dist build-tmp

# Root of the zip: manifest + UI files referenced by plugin.json (uri: index.html)
cp manifest/plugin.json build-tmp/
cp ui/index.html ui/locale-probe.js build-tmp/

( cd build-tmp && zip -r ../dist/plugin.zip . >/dev/null )
rm -rf build-tmp

echo "Built dist/plugin.zip:"
unzip -l dist/plugin.zip
