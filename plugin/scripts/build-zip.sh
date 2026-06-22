#!/usr/bin/env bash
# Build the remote plug-in package dist/plugin.zip that vCenter downloads.
# vSphere 9.x remote plugins are delivered as a .zip whose root contains the
# plugin.json manifest plus the UI assets it references.
set -euo pipefail

cd "$(dirname "$0")/.."        # -> plugin/
rm -rf dist build-tmp
mkdir -p dist build-tmp

# Root of the zip: manifest + UI + per-locale data files. The plugin fetches the
# selected language's data at runtime (offline inside vCenter; only the chosen
# language is loaded). Add a locale by dropping in glossary.<loc>.json +
# alarm-explanations.<loc>.json and a popup/UI option.
cp manifest/plugin.json build-tmp/
cp ui/index.html ui/app.js ui/app.css ui/vc-api.js build-tmp/

# 各语言数据(术语表 + 告警解释库)
for g in i18n/glossary.*.json; do
  case "$g" in *conflicts*|*overrides*) continue;; esac
  cp "$g" build-tmp/
done
cp semantics/alarm-explanations.*.json build-tmp/

echo "bundled locales:"
ls build-tmp/glossary.*.json | sed 's#.*/glossary\.##; s#\.json##' | tr '\n' ' '; echo

( cd build-tmp && zip -r ../dist/plugin.zip . >/dev/null )
rm -rf build-tmp

echo "Built dist/plugin.zip:"
unzip -l dist/plugin.zip
