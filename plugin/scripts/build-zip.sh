#!/usr/bin/env bash
# Build the remote plug-in package dist/plugin.zip that vCenter downloads.
# vSphere 9.x remote plugins are delivered as a .zip whose root contains the
# plugin.json manifest plus the UI assets it references.
set -euo pipefail

cd "$(dirname "$0")/.."        # -> plugin/
rm -rf dist build-tmp
mkdir -p dist build-tmp

# Root of the zip: manifest + UI + bundled data (glossary + alarm explanations).
# Data is inlined as JS (window.__glossary / window.__alarms) so the plugin works
# fully offline inside vCenter — no backend/fetch needed for the MVP.
cp manifest/plugin.json build-tmp/
cp ui/index.html ui/app.js ui/app.css ui/vc-api.js build-tmp/

node -e '
const fs=require("fs");
const g=JSON.parse(fs.readFileSync("i18n/glossary.zh-CN.json","utf8"));
fs.writeFileSync("build-tmp/glossary-data.js","window.__glossary="+JSON.stringify(g)+";\n");
const a=JSON.parse(fs.readFileSync("semantics/alarm-explanations.zh-CN.json","utf8"));
fs.writeFileSync("build-tmp/alarm-data.js","window.__alarms="+JSON.stringify(a)+";\n");
console.log("bundled glossary:",Object.keys(g).length,"terms; alarms:",Object.keys(a).filter(k=>k!=="_meta").length);
'

( cd build-tmp && zip -r ../dist/plugin.zip . >/dev/null )
rm -rf build-tmp

echo "Built dist/plugin.zip:"
unzip -l dist/plugin.zip
