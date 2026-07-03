# VCF 9 UI Translator

[English](README.md) · **简体中文** · [繁體中文](README.zh-TW.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [한국어](README.ko.md)

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20应用商店-安装-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/vcf-9-ui-translator/fcpofclniofejlnhfckblonhecghkbmp)
[![最新版本](https://img.shields.io/github/v/release/vcf-rosetta/vcf-rosetta?label=离线包)](https://github.com/vcf-rosetta/vcf-rosetta/releases/latest)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

**VMware vCenter / VCF 9.x / Aria Operations(VCF Operations)** 控制台界面**实时翻译**。
VCF 9 官方只提供 English / 日本語 / Español / Français —— 这个免费开源的 Chrome/Edge 扩展把平台放弃的
5 种语言装回去:**简体中文 · 繁體中文 · Deutsch · Italiano · 한국어**。

> GitHub 项目代号 **vcf-rosetta** —— 取自罗塞塔石碑,多语言对照的经典符号。

## 亮点

- **浏览即翻译** —— 纯前端 DOM 实时替换;不改 vCenter 服务器,不在服务器端装任何东西。
- **隐私优先** —— 页面内容绝不外发;词典是纯数据 JSON。
- **每语言 5 万+ 审校词条**,基于 VMware 官方语言包 + 现场采集回流构建。
  简体中文已覆盖日常界面约 90%;繁体中文紧随其后;德/意/韩可用且持续改进。
- **隔离网可用** —— 离线包内置全部词典,装后零联网。
- **词典自动更新**(商店版)—— 新词条经 CDN 自动到达已装用户,无需等扩展发版。

## 安装

📘 **图文安装/使用指南(6 语言)**:<https://vcf-rosetta.github.io/vcf-rosetta/>

### 方式一:Chrome 应用商店(联网,推荐)

安装 **[VCF 9 UI Translator](https://chromewebstore.google.com/detail/vcf-9-ui-translator/fcpofclniofejlnhfckblonhecghkbmp)**(Chrome 和 Edge 都能用)。
打开 vCenter / VCF / Aria Ops 控制台 → 点扩展图标 → 选语言 → 完成。
词典按需下载(jsDelivr + 镜像回退),并自动保持最新。

### 方式二:离线包(隔离网 / 客户现场)

1. 下载离线包(词典内置,~6 MB,**装后零联网**):
   👉 <https://github.com/vcf-rosetta/vcf-rosetta/releases/latest/download/vcf-rosetta-offline.zip>
2. 解压到一个固定、不会删的目录(里面有 `manifest.json`)。
3. 打开 `chrome://extensions`(Edge:`edge://extensions`)→ 开 **开发者模式**。
4. 点 **加载已解压的扩展程序** → 选解压出的文件夹(不是 zip 本身)。
5. 打开控制台,点图标,选语言。

> GitHub Release **只提供离线包** —— 从这里下载的包一定带词典,不会下错。

## 发现没翻译的词?

在弹窗开启**「收集未翻译词条」**,浏览相关页面后点**「导出 JSON」**或**「贡献」**(自动打开预填好的
GitHub Issue)。只回传英文界面词条,绝不含业务数据。
Bug / 新语言需求:<https://github.com/vcf-rosetta/vcf-rosetta/issues>

## 词典怎么来

```
浏览器扩展 ──①内置(离线包)──▶ 直接用
          ──②本地缓存──────▶ chrome.storage(版本一致)
          ──③CDN 按需下载──▶ cdn.jsdelivr.net/gh/vcf-rosetta/vcf-rosetta@v<版本>/browser-extension/dict.<lang>.json
                             (版本号来自 @main 的 langs.json;tag 未就绪或主域不可达时自动回退 @main / 镜像域)
```

## 仓库结构

| 目录 | 内容 |
|------|------|
| [`browser-extension/`](browser-extension/) | **扩展本体**(Chrome/Edge MV3);打包与上架物料见 `scripts/` 与 `store/` |
| [`plugin/i18n/`](plugin/i18n/) | 术语词库(英 → 5 种语言),词典由此构建 |
| [`contrib/`](contrib/) | 社区词条回流工具(采集 → Issue → 合并) |
| [`docs/`](docs/) | 安装指南(GitHub Pages)、架构、路线图 |
| [`plugin/`](plugin/) | (暂缓)vSphere Client remote plug-in PoC —— 代码保留,不部署 |

## 从源码构建(维护者)

```bash
git clone https://github.com/vcf-rosetta/vcf-rosetta.git
cd vcf-rosetta
# dict.*.json 已随仓库入库,clone 即用。仅当改了词库源才需重建:
node browser-extension/build-dict.mjs                       # 重建 dict.*.json
node browser-extension/scripts/pack-store.mjs --offline     # 离线包(~6 MB,词典内置)
node browser-extension/scripts/pack-store.mjs               # 轻量包(仅用于商店后台上传)
```

## 许可证与团队

[Apache-2.0](LICENSE)。社区本地化工具 —— **与 Broadcom / VMware 无隶属关系**,不分发任何 VMware 软件;
"VMware"、"vCenter"、"vSphere"、"VCF" 等商标归各自所有者。

开发团队:Tony Yuan <mycloud2015@126.com> · Jingsong Yang <yjs@tanzu.eu.org> · Wei Zhou <zhouwei008@gmail.com> ——
Bug、翻译纠错、优化建议或新增语言需求欢迎联系。
