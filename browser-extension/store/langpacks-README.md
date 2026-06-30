# VCF 9 UI Translator

Real-time UI translation for the **VMware vCenter Server / VCF 9.x** web console — entirely in your browser, no server changes.

> 实时把 **VMware vCenter / VCF 9.x** 控制台界面翻译成你的语言,纯浏览器本地运行,不改动服务器。

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

---

## What it does · 功能

- **Translates the console as you browse** — client-side DOM text replacement, in real time.
- **5 languages:** 简体中文 · 繁體中文 · Deutsch · Italiano · 한국어. The popup interface itself is localized into 6 languages and follows your browser language by default.
- **Only on vCenter/VCF pages** — the content script first checks for vCenter console markers; on any other page it loads nothing and does nothing. You can narrow scope further with a per-host allow-list.
- **Dictionaries** are built from VMware's official localization packs plus curated terminology (48k+ terms) and fetched on demand from this public data repo via CDN, then cached locally.

> 浏览即翻译;支持 5 种翻译语言、6 种界面语言;仅在识别为 vCenter/VCF 的页面生效,其他网站不加载、不处理;词典基于官方语言包 + 人工校订(4.8 万+ 词条),按需经 CDN 下载并本地缓存。

## Install · 安装

- **Chrome Web Store:** _(link coming after review)_
- **Manual / offline:** download the latest `.zip` from Releases → `chrome://extensions` → enable Developer mode → "Load unpacked" (or drag the zip in). Suitable for air-gapped / customer sites.

## Privacy · 隐私

No personal data is collected. Page content is **never** sent to any server — translation happens locally. Only your settings (language, host allow-list, flags) are stored in `chrome.storage`. See [PRIVACY.md](./PRIVACY.md).

> 不收集任何个人信息;页面内容**绝不**外发,翻译全程本地完成;仅在本地保存你的偏好设置。

## Contributing · 贡献

Found UI text that isn't translated yet? In the popup, enable **"Collect untranslated terms"**, browse the pages, then **Export JSON** or **Contribute** (opens a pre-filled GitHub Issue here). Only English UI strings are sent — never business data.

> 发现未翻译的界面词?在弹窗里开启「收集未翻译词条」,浏览相关页面后点「导出 JSON」或「贡献 GitHub」(会在本仓库打开预填的 Issue)。只回传英文界面词条,不含业务数据。

- Issues / new-language requests: <https://github.com/vcf-rosetta/langpacks/issues>

## This repository · 关于本仓库

This is the **public language-pack data repo**: it holds the built dictionaries (`dict.<lang>.json`) and the language catalog (`langs.json`) that the extension downloads at runtime via jsDelivr:

```
https://cdn.jsdelivr.net/gh/vcf-rosetta/langpacks@main/dict.zh-CN.json
```

The extension package itself stays lightweight (~65 KB) and pulls dictionaries on demand.

## License & disclaimer · 许可与声明

Apache-2.0. A community localization tool — **not affiliated with Broadcom / VMware**, and it does not distribute any VMware software. "VMware", "vCenter", "vSphere" and "VCF" are trademarks of their respective owners.

> Apache-2.0 许可。社区本地化工具,**与 Broadcom / VMware 无隶属关系**,不分发任何 VMware 软件;相关商标归各自所有者。

## Contact · 联系

- Tony Yuan · mycloud2015@126.com
- Jingsong Yang · yjs@tanzu.eu.org
- Wei Zhou · zhouwei008@gmail.com
