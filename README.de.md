# VCF 9 UI Translator

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · **Deutsch** · [Italiano](README.it.md) · [한국어](README.ko.md)

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-installieren-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/vcf-9-ui-translator/fcpofclniofejlnhfckblonhecghkbmp)
[![Neueste Version](https://img.shields.io/github/v/release/vcf-rosetta/vcf-rosetta?label=Offline-Paket)](https://github.com/vcf-rosetta/vcf-rosetta/releases/latest)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

**Echtzeit-Lokalisierung im Browser** für die Webkonsole von **VMware vCenter / VCF 9.x / Aria Operations (VCF Operations)**.
VCF 9 liefert nur English / 日本語 / Español / Français — diese freie Open-Source-Erweiterung für Chrome/Edge bringt die
fünf gestrichenen Sprachen zurück: **简体中文 · 繁體中文 · Deutsch · Italiano · 한국어**.

> Das GitHub-Projekt trägt den Codenamen **vcf-rosetta** — nach dem Stein von Rosetta, dem klassischen Symbol paralleler Sprachen.

## Highlights

- **Übersetzt beim Browsen** — clientseitige DOM-Textersetzung in Echtzeit; keine Serveränderungen, nichts wird auf vCenter installiert.
- **Privacy by Design** — Seiteninhalte verlassen niemals den Browser; Wörterbücher sind reine Daten-JSONs.
- **50k+ kuratierte Begriffe pro Sprache**, gebaut aus VMwares offiziellen Sprachpaketen plus Feldsammlung.
  Vereinfachtes Chinesisch deckt ~90 % der Alltagsbildschirme ab; Deutsch/Italienisch/Koreanisch sind nutzbar und werden laufend besser — Feedback willkommen!
- **Air-gapped-tauglich** — das Offline-Paket bündelt alle Wörterbücher; nach der Installation ist kein Netz nötig.
- **Selbstaktualisierende Wörterbücher** (Store-Version) — neue Begriffe erreichen installierte Nutzer automatisch per CDN.

## Installation

📘 **Bebilderte Installations- und Bedienungsanleitung (6 Sprachen):** <https://vcf-rosetta.github.io/vcf-rosetta/>

### Option 1 — Chrome Web Store (online, empfohlen)

**[VCF 9 UI Translator](https://chromewebstore.google.com/detail/vcf-9-ui-translator/fcpofclniofejlnhfckblonhecghkbmp)** installieren (funktioniert in Chrome und Edge).
vCenter- / VCF- / Aria-Ops-Konsole öffnen → Erweiterungssymbol anklicken → Sprache wählen → fertig.

### Option 2 — Offline-Paket (air-gapped / Kundenstandorte)

1. Offline-Paket herunterladen (Wörterbücher enthalten, ~6 MB, **null Netz nach der Installation**):
   👉 <https://github.com/vcf-rosetta/vcf-rosetta/releases/latest/download/vcf-rosetta-offline.zip>
2. In einen dauerhaften Ordner entpacken (enthält `manifest.json`).
3. `chrome://extensions` öffnen (Edge: `edge://extensions`) → **Entwicklermodus** aktivieren.
4. **Entpackte Erweiterung laden** → den entpackten Ordner wählen (nicht die Zip-Datei).
5. Konsole öffnen, Symbol anklicken, Sprache wählen.

> GitHub-Releases enthalten **nur** das Offline-Paket — was Sie hier herunterladen, enthält immer die Wörterbücher.

## Unübersetzten Text gefunden?

Im Popup **„Collect untranslated terms"** aktivieren, die betroffenen Bildschirme durchklicken, dann **Export JSON**
oder **Contribute** (öffnet ein vorausgefülltes GitHub Issue). Es werden nur englische UI-Strings gesendet — niemals Geschäftsdaten.
Issues / Wünsche für neue Sprachen: <https://github.com/vcf-rosetta/vcf-rosetta/issues>

## Repository-Struktur

| Pfad | Inhalt |
|------|--------|
| [`browser-extension/`](browser-extension/) | **Die Erweiterung** (Chrome/Edge MV3); Packaging & Store-Material in `scripts/` und `store/` |
| [`plugin/i18n/`](plugin/i18n/) | Terminologiedatenbank (EN → 5 Sprachen), Quelle der Wörterbücher |
| [`contrib/`](contrib/) | Community-Werkzeuge für den Begriffs-Rücklauf (sammeln → Issue → mergen) |
| [`docs/`](docs/) | Installationsanleitung (GitHub Pages), Architektur, Roadmap |
| [`plugin/`](plugin/) | (pausiert) vSphere-Client-Remote-Plug-in-PoC — Code bleibt erhalten, wird nicht deployt |

## Lizenz & Team

[Apache-2.0](LICENSE). Ein Community-Lokalisierungswerkzeug — **nicht mit Broadcom / VMware verbunden**; es verteilt
keine VMware-Software. „VMware", „vCenter", „vSphere" und „VCF" sind Marken ihrer jeweiligen Eigentümer.

Entwickler: Tony Yuan <mycloud2015@126.com> · Jingsong Yang <yjs@tanzu.eu.org> · Wei Zhou <zhouwei008@gmail.com> —
Bugreports, Übersetzungskorrekturen und Sprachwünsche sind willkommen.
