# Chrome Web Store — Listing copy (v3.4.31)

> Paste into the Chrome Developer Dashboard "Store listing". Summary ≤132 chars.
> The popup UI ships in 6 languages (English, Simplified/Traditional Chinese, German, Italian, Korean) and on first open follows the browser language, falling back to English. The store name/description in `chrome://extensions` also localize per browser language via `_locales/`.

## Name
**VCF 9 UI Translator**

(Unified with the manifest name shown in `chrome://extensions`.)

## Summary (≤132 chars)
Real-time UI translation for the VMware vCenter / VCF 9.x console into Simplified/Traditional Chinese, German, Italian or Korean.

## Category
Developer Tools (or Workflow & Planning)

## Language
English (default); listing name/description also localized to zh-CN, zh-TW, de, it, ko.

## Description
VCF 9 UI Translator translates the VMware vCenter Server / VCF 9.x web console UI into your chosen language, in real time, entirely in your browser.

• Client-side DOM text replacement — it does NOT modify or proxy the vCenter server, and never touches your business data or configuration.
• Dictionaries are built from VMware's official localization packs plus curated terminology (48k+ terms), for consistent wording.
• Five translation languages: Simplified Chinese, Traditional Chinese, German, Italian, Korean — pick yours in the popup. Default is English (no translation) until you choose.
• The popup interface itself is localized into 6 languages and follows your browser language on first open (English fallback); switch it any time from the top-right selector.
• Activates only on pages detected as a vCenter / VCF console; you can narrow scope further with a per-host allow-list (one-click add/remove the current site).
• Dictionaries are fetched on demand from a public data repo via CDN and cached locally; page content is never sent to any server.
• Export untranslated terms to help us keep improving coverage.

For VMware Cloud Foundation 9.x / vSphere operations teams who prefer a localized console.

Note: a community localization tool, not affiliated with Broadcom / VMware, and it does not distribute any VMware software.

## Single purpose (required)
The extension's sole purpose: localize (translate) the VMware vCenter / VCF web console UI text into the user's chosen language.

## Permission justifications (required)
- **storage**: persist user settings (language, interface language, active host allow-list, collect-terms flag). Local / account-sync only, never sent out.
- **activeTab**: read the current tab's hostname for the one-click allow-list buttons and reload the tab on language change. (No `scripting` permission — the content script is statically declared in the manifest.)
- **host access (`https://*/*`)**: vCenter/VCF runs on customer-owned, arbitrary internal hostnames that cannot be enumerated in advance, so the extension must detect on each visited HTTPS page whether it is a vCenter console before replacing text. **The content script first checks for vCenter page markers; on non-vCenter pages it loads no dictionary and does nothing.** Users can further narrow scope via the popup allow-list.
- **host_permissions `cdn.jsdelivr.net` / `fastly.jsdelivr.net` / `gcore.jsdelivr.net`**: download language-pack JSON (data only, never executable code) on demand and cache locally; the fastly/gcore hosts are official jsDelivr mirrors used as fallbacks on networks where the primary CDN host is unreachable.

## Privacy practices (required — fill truthfully)
- Collects user data: **No**.
- No PII collected or transmitted, no remote analytics. All processing is local.
- Privacy policy URL: host `store/PRIVACY.md` as a public URL (e.g. GitHub Pages, or a raw link in the public `vcf-rosetta/vcf-rosetta` repo) before submitting.
