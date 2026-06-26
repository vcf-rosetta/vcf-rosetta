# Chrome Web Store — Listing copy (v3.4.17)

> Paste into the Chrome Developer Dashboard "Store listing". Summary ≤132 chars. UI is English-default now (`_locales/en` only); Chinese appears only when the user picks a Chinese language inside the popup.

## Name
**Rosetta — vCenter / VCF UI Translator**

## Summary (≤132 chars)
Real-time UI translation for the VMware vCenter / VCF 9.x console into Simplified/Traditional Chinese, German, Italian or Korean.

## Category
Developer Tools (or Workflow & Planning)

## Language
English (default)

## Description
Rosetta translates the VMware vCenter Server / VCF 9.x web console UI into your chosen language, in real time, entirely in your browser.

• Client-side DOM text replacement — it does NOT modify or proxy the vCenter server, and never touches your business data or configuration.
• Dictionaries are built from VMware's official localization packs plus curated terminology (48k+ terms), for consistent wording.
• Five languages: Simplified Chinese, Traditional Chinese, German, Italian, Korean — pick yours in the popup. Default is English (no translation) until you choose.
• Activates only on pages detected as a vCenter / VCF console; you can narrow scope further with a per-host allow-list (one-click add/remove the current site).
• Dictionaries are fetched on demand from a public data repo via CDN and cached locally; page content is never sent to any server.
• Export untranslated terms to help us keep improving coverage.

For VMware Cloud Foundation 9.x / vSphere operations teams who prefer a localized console.

Note: a community localization tool, not affiliated with Broadcom / VMware, and it does not distribute any VMware software.

## Single purpose (required)
The extension's sole purpose: localize (translate) the VMware vCenter / VCF web console UI text into the user's chosen language.

## Permission justifications (required)
- **storage**: persist user settings (enable toggle, language, active host allow-list, collect-terms flag). Local / account-sync only, never sent out.
- **scripting / activeTab**: apply translation to the current vCenter tab and refresh on language change.
- **host access (`https://*/*`)**: vCenter/VCF runs on customer-owned, arbitrary internal hostnames that cannot be enumerated in advance, so the extension must detect on each visited HTTPS page whether it is a vCenter console before replacing text. **The content script first checks for vCenter page markers; on non-vCenter pages it loads no dictionary and does nothing.** Users can further narrow scope via the popup allow-list.
- **host_permissions `cdn.jsdelivr.net`**: download language-pack JSON (data only, never executable code) on demand and cache locally.

## Privacy practices (required — fill truthfully)
- Collects user data: **No**.
- No PII collected or transmitted, no remote analytics. All processing is local.
- Privacy policy URL: host `store/PRIVACY.md` as a public URL (e.g. GitHub Pages, or the public `vcf-rosetta/langpacks` repo) before submitting.
