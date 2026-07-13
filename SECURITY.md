# Security Policy

`vcf-rosetta` ships a browser extension whose content script runs inside VMware
vCenter / VCF administration consoles, and a plug-in server that registers with
vCenter. We take reports affecting that surface seriously.

## Supported versions

Only the latest published extension version receives security fixes. Check the
current version in [`browser-extension/manifest.json`](browser-extension/manifest.json).

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

- Preferred: GitHub **private vulnerability reporting** — the *Report a vulnerability*
  button under this repository's **Security** tab.
- Alternatively, email **mycloud2015@126.com** (subject prefixed `SECURITY:`).

Please include: affected component (extension / plug-in server / dictionary
pipeline), version, a description, and reproduction steps or a proof of concept.

We aim to acknowledge within **5 business days** and to agree on a disclosure
timeline once the issue is confirmed. Please allow us a reasonable window to ship
a fix before any public disclosure.

## Scope notes

- **Dictionaries** are served from jsDelivr, pinned to immutable git tags
  (`@v<version>`), and verified in the extension against a SHA-256 recorded in the
  bundled `langs.json`. Reports about dictionary tampering or the CDN trust model
  are in scope.
- **The plug-in server** (`plugin/`) is a self-hosted, operator-run component. By
  default the vCenter registration path verifies TLS; report any path that weakens
  this without an explicit opt-in.
- This is an independent, community project **not affiliated with or endorsed by
  Broadcom / VMware**.
