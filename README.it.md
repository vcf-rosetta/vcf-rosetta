# VCF 9 UI Translator

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Deutsch](README.de.md) · **Italiano** · [한국어](README.ko.md)

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-installa-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/vcf-9-ui-translator/fcpofclniofejlnhfckblonhecghkbmp)
[![Ultima release](https://img.shields.io/github/v/release/vcf-rosetta/vcf-rosetta?label=pacchetto%20offline)](https://github.com/vcf-rosetta/vcf-rosetta/releases/latest)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

**Localizzazione in tempo reale, nel browser**, per la console web di **VMware vCenter / VCF 9.x / Aria Operations (VCF Operations)**.
VCF 9 offre solo English / 日本語 / Español / Français — questa estensione gratuita e open source per Chrome/Edge riporta
le cinque lingue abbandonate dalla piattaforma: **简体中文 · 繁體中文 · Deutsch · Italiano · 한국어**.

> Il progetto GitHub ha il nome in codice **vcf-rosetta** — dalla Stele di Rosetta, simbolo classico delle lingue parallele.

## Punti di forza

- **Traduce mentre navighi** — sostituzione del testo DOM lato client, in tempo reale; nessuna modifica al server, nulla da installare su vCenter.
- **Privacy by design** — il contenuto delle pagine non lascia mai il browser; i dizionari sono JSON di soli dati.
- **50k+ termini curati per lingua**, costruiti dai pacchetti di localizzazione ufficiali VMware più la terminologia raccolta sul campo.
  Il cinese semplificato copre ~90% delle schermate quotidiane; italiano/tedesco/coreano sono utilizzabili e in costante miglioramento — il tuo feedback è prezioso!
- **Funziona air-gapped** — il pacchetto offline include tutti i dizionari; zero rete dopo l'installazione.
- **Dizionari ad aggiornamento automatico** (versione store) — i nuovi termini raggiungono gli utenti via CDN, senza nuove release.

## Installazione

📘 **Guida illustrata all'installazione e all'uso (6 lingue):** <https://vcf-rosetta.github.io/vcf-rosetta/>

### Opzione 1 — Chrome Web Store (online, consigliata)

Installa **[VCF 9 UI Translator](https://chromewebstore.google.com/detail/vcf-9-ui-translator/fcpofclniofejlnhfckblonhecghkbmp)** (funziona in Chrome ed Edge).
Apri la console vCenter / VCF / Aria Ops → clicca l'icona dell'estensione → scegli la lingua → fatto.

### Opzione 2 — Pacchetto offline (siti air-gapped / presso il cliente)

1. Scarica il pacchetto offline (dizionari inclusi, ~6 MB, **zero rete dopo l'installazione**):
   👉 <https://github.com/vcf-rosetta/vcf-rosetta/releases/latest/download/vcf-rosetta-offline.zip>
2. Estrai in una cartella permanente (contiene `manifest.json`).
3. Apri `chrome://extensions` (Edge: `edge://extensions`) → attiva la **Modalità sviluppatore**.
4. Clicca **Carica estensione non pacchettizzata** → seleziona la cartella estratta (non lo zip).
5. Apri la console, clicca l'icona, scegli la lingua.

> Le release GitHub contengono **solo** il pacchetto offline — ciò che scarichi include sempre i dizionari.

## Hai trovato testo non tradotto?

Attiva **"Collect untranslated terms"** nel popup, naviga le schermate interessate, poi **Export JSON** oppure
**Contribute** (apre una GitHub Issue precompilata). Vengono inviate solo stringhe UI in inglese — mai dati aziendali.
Issue / richieste di nuove lingue: <https://github.com/vcf-rosetta/vcf-rosetta/issues>

## Struttura del repository

| Percorso | Contenuto |
|----------|-----------|
| [`browser-extension/`](browser-extension/) | **L'estensione** (Chrome/Edge MV3); packaging e materiale store in `scripts/` e `store/` |
| [`plugin/i18n/`](plugin/i18n/) | Database terminologico (EN → 5 lingue) da cui si costruiscono i dizionari |
| [`contrib/`](contrib/) | Strumenti per il round-trip dei termini della community (raccolta → Issue → merge) |
| [`docs/`](docs/) | Guida all'installazione (GitHub Pages), architettura, roadmap |
| [`plugin/`](plugin/) | (in pausa) PoC del remote plug-in per vSphere Client — codice conservato, non distribuito |

## Licenza e team

[Apache-2.0](LICENSE). Uno strumento di localizzazione della community — **non affiliato a Broadcom / VMware**; non
distribuisce alcun software VMware. "VMware", "vCenter", "vSphere" e "VCF" sono marchi dei rispettivi proprietari.

Sviluppatori: Tony Yuan <mycloud2015@126.com> · Jingsong Yang <yjs@tanzu.eu.org> · Wei Zhou <zhouwei008@gmail.com> —
segnalazioni di bug, correzioni delle traduzioni e richieste di nuove lingue sono benvenute.
