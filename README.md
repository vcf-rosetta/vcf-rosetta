# VCF 9 UI Translator

**English** · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [한국어](README.ko.md)

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-install-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/vcf-9-ui-translator/fcpofclniofejlnhfckblonhecghkbmp)
[![Latest release](https://img.shields.io/github/v/release/vcf-rosetta/vcf-rosetta?label=offline%20pack)](https://github.com/vcf-rosetta/vcf-rosetta/releases/latest)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

Real-time, in-browser localization for the **VMware vCenter / VCF 9.x / Aria Operations (VCF Operations)** web console.
VCF 9 ships with only English / 日本語 / Español / Français — this free, open-source Chrome/Edge extension puts back the
five languages the platform dropped: **简体中文 · 繁體中文 · Deutsch · Italiano · 한국어**.

> The GitHub project is codenamed **vcf-rosetta** — after the Rosetta Stone, the classic symbol of parallel languages.

## Highlights

- **Translates as you browse** — client-side DOM text replacement, in real time; no server changes, nothing installed on vCenter.
- **Private by design** — page content never leaves your browser; dictionaries are data-only JSON.
- **50k+ curated terms per language**, built from VMware's official localization packs plus field-collected terminology.
  Simplified Chinese covers ~90% of everyday console screens; Traditional Chinese is close behind; de/it/ko are usable and improving.
- **Works air-gapped** — the offline pack bundles all dictionaries; zero network needed.
- **Self-updating dictionaries** (store version) — new terms reach installed users automatically via CDN, no re-release needed.

## Install

📘 **Illustrated install & user guide (6 languages):** <https://vcf-rosetta.github.io/vcf-rosetta/>

### Option 1 — Chrome Web Store (online, recommended)

Install **[VCF 9 UI Translator](https://chromewebstore.google.com/detail/vcf-9-ui-translator/fcpofclniofejlnhfckblonhecghkbmp)** (works in Chrome and Edge).
Open your vCenter / VCF / Aria Ops console → click the extension icon → pick a language → done.
Dictionaries download on demand (via jsDelivr with mirror fallbacks) and stay up to date automatically.

### Option 2 — Offline pack (air-gapped / customer sites)

1. Download the offline pack (dictionaries bundled, ~6 MB, **zero network needed after install**):
   👉 <https://github.com/vcf-rosetta/vcf-rosetta/releases/latest/download/vcf-rosetta-offline.zip>
2. Unzip to a permanent folder (you'll see `manifest.json` inside).
3. Open `chrome://extensions` (Edge: `edge://extensions`) → enable **Developer mode**.
4. Click **Load unpacked** → select the unzipped folder (not the zip).
5. Open the console, click the icon, pick a language.

> GitHub Releases ship **only** the offline pack, so whatever you download always includes the dictionaries.

## Found untranslated text?

Enable **"Collect untranslated terms"** in the popup, browse the affected screens, then **Export JSON** or
**Contribute** (opens a pre-filled GitHub Issue). Only English UI strings are sent — never business data.
Issues / new-language requests: <https://github.com/vcf-rosetta/vcf-rosetta/issues>

## How dictionaries are delivered

```
extension ──① bundled (offline pack)──▶ use directly
          ──② local cache────────────▶ chrome.storage (version-matched)
          ──③ CDN on demand──────────▶ cdn.jsdelivr.net/gh/vcf-rosetta/vcf-rosetta@v<ver>/browser-extension/dict.<lang>.json
                                       (version discovered via @main langs.json; falls back to @main / mirror hosts)
```

## Repository layout

| Path | Contents |
|------|----------|
| [`browser-extension/`](browser-extension/) | **The extension** (Chrome/Edge MV3); packaging & store material in `scripts/` and `store/` |
| [`plugin/i18n/`](plugin/i18n/) | Terminology database (EN → 5 languages) the dictionaries are built from |
| [`contrib/`](contrib/) | Community term round-trip tooling (collect → Issue → merge) |
| [`docs/`](docs/) | Install guide (GitHub Pages), architecture, roadmap |
| [`plugin/`](plugin/) | (paused) vSphere Client remote plug-in PoC — kept for reference, not deployed |

## Build from source (maintainers)

```bash
git clone https://github.com/vcf-rosetta/vcf-rosetta.git
cd vcf-rosetta
# dict.*.json are committed — clone and go. Rebuild only after editing glossary sources:
node browser-extension/build-dict.mjs                       # rebuild dict.*.json
node browser-extension/scripts/pack-store.mjs --offline     # offline pack (~6 MB, dictionaries bundled)
node browser-extension/scripts/pack-store.mjs               # lite pack (store upload artifact only)
```

## License & team

[Apache-2.0](LICENSE). A community localization tool — **not affiliated with Broadcom / VMware**; it does not
distribute any VMware software. "VMware", "vCenter", "vSphere" and "VCF" are trademarks of their respective owners.

Developers: Tony Yuan <mycloud2015@126.com> · Jingsong Yang <yjs@tanzu.eu.org> · Wei Zhou <zhouwei008@gmail.com> —
bug reports, translation fixes and new-language requests are all welcome.
