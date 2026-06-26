# browser-extension — VCF / vCenter UI 多语言翻译

把 **VMware vCenter / VCF 9.x / Aria Operations(VCF Operations)的原生 Web 控制台 UI 实时翻译**
为所选语言的浏览器扩展(Chrome/Edge MV3),完全在浏览器侧工作,**不修改 vCenter 服务器、不上传任何业务数据**。
翻译由 [`plugin/i18n/`](../plugin/i18n/) 的术语词库(zh-CN **49,950 条**:官方 + 审定)驱动。

> 为什么用浏览器扩展而非 vSphere 远程插件:远程插件跑在沙箱 iframe 里,只能翻自己的视图,
> **碰不到 vCenter 宿主 UI**;浏览器扩展有整页访问权,**能翻译整个原生界面**——这才是"让 VCF 变中文"的载体。
> 远程插件(`../plugin/`)是另一条线、⏸️ 暂缓的 POC,不参与界面汉化。

## 语言范围(重要)

VCF 9 原生只公开支持 **4 种**界面语言:English / 日本語 / Español / Français —— 这 4 种用户在 VCF 9 里
直接切即可,**本扩展不为其制作翻译包**。本扩展只补 VCF 9 **已放弃**、不再原生提供的语言:

| 语言 | code | 来源 |
|------|------|------|
| 简体中文 | `zh-CN` | 官方 + 审定(curated,49,950 条) |
| 繁體中文 | `zh-TW` | 官方 |
| Deutsch 德文 | `de` | 官方 |
| Italiano 意大利文 | `it` | 官方 |
| 한국어 韩文 | `ko` | 官方 |

界面默认英文,在弹窗里选语言才切换。详见 [`../plugin/i18n/`](../plugin/i18n/)。

## 结构

```
browser-extension/
├── manifest.json            MV3 清单(默认英文界面)
├── langs.json               可下载语言目录 + 各语言版本号(驱动下拉框与缓存刷新)
├── dict.<locale>.json       各语言词典(自动生成,gitignore,不入库)
├── build-dict.mjs           从 ../plugin/i18n/glossary.<locale>.json 生成 dict.<locale>.json
├── content/translator.js    翻译引擎:递归遍历(穿透 shadow DOM/同源 iframe)+ MutationObserver
├── popup/                   语言选择 / 站点白名单 / 词条采集 / 词典版本与刷新 / 关于
├── _locales/en/             扩展自身界面文案(英文)
├── scripts/
│   ├── pack-store.mjs        打包:轻量包(CDN 取词典)/ 离线包(--offline,内置词典)
│   └── publish-langpacks.sh  把 dict.*.json 发布到公开 langpacks 仓库 + 刷 jsDelivr 缓存
└── store/                   Chrome 应用商店上架物料
```

## 安装(开发者模式)

```bash
git clone https://github.com/vcf-rosetta/vcf-rosetta.git
cd vcf-rosetta
node browser-extension/build-dict.mjs    # 从 glossary 生成 dict.<locale>.json(首次必跑;dict 不入库)
```
1. Chrome/Edge 打开 `chrome://extensions`,开启「开发者模式」
2. 「加载已解压的扩展程序」→ 选 `browser-extension/` 目录
3. 打开 vCenter / VCF / Aria Ops 页面 → 点扩展图标 → 选语言 → 自动翻译

> `dict.*.json` 由 `glossary.*.json` 生成(较大,gitignore 不入库)。clone 或词表更新后重跑 `build-dict.mjs`。

## 词典三级加载(loadDict)

弹窗选语言后,内容脚本按优先级取词典:
1. **扩展内置** `chrome-extension://…/dict.<lang>.json` —— 离线包走这条,零联网。
2. **本地缓存**(`chrome.storage.local`,版本一致才用)。
3. **远程下载** —— 从公开数据仓库 [`vcf-rosetta/langpacks`](https://github.com/vcf-rosetta/langpacks) 经 jsDelivr 下载并写缓存。

弹窗的「词典」行会显示当前用的是哪一级(`内置/缓存/在线`)、语言、版本号、条数;旁边 **↻ 刷新词典** 可清缓存强制重取最新。

## 打包(两种)

```bash
node browser-extension/scripts/pack-store.mjs            # 轻量包(~28KB):运行时按需从 CDN 下词典
node browser-extension/scripts/pack-store.mjs --offline  # 离线包(~5MB):词典内置,隔离网/客户现场零联网
```
- **离线部署**:装离线包(`-offline.zip`)→ 词典已内置,弹窗里 5 种语言全部"现成可用"(无下载标记),选语言即用。
- **商店/联网**:装轻量包 → 选语言 → 自动从 CDN 下载并缓存。上架前须先 `publish-langpacks.sh` 发词典,见 `store/SUBMIT-CHECKLIST.md`。

## 配置(弹窗)

- **翻译语言**:即开关 —— 选 `English(原文)`=不翻译;选某语言=翻译。**没有独立的"启用"开关**(选语言即生效)。
- **强制启用的站点**:留空则自动识别(`/ui` 路径 / 标题含 vSphere、vCenter、SDDC Manager、Aria/VCF Operations、Log / Clarity 框架特征);可一键「添加/移除当前站点」。
- **收集未翻译词条**(默认关):浏览缺词页面后,一键导出 JSON / 贡献到 GitHub / 邮件回流(见 [`../contrib/`](../contrib/))。
- 切换语言或保存后**刷新页面**生效。

## 工作原理

- `translator.js` 递归遍历 DOM 文本节点 + 属性(placeholder/title/aria-label),命中词库即替换;
  **穿透 open shadow DOM 与同源 iframe**(VCF Operations 仪表板、数据网格列头都在 shadow DOM 里),并对每个 shadow root / iframe 单独挂 `MutationObserver`,跟踪 Angular SPA 路由与异步加载持续翻译。
- 跳过 `script/style/code/pre/textarea`,保留文本首尾空白。
- 采集与翻译共用同一遍历器:翻译器够得到的地方才能采集到缺词。

## 已知边界

- 只翻译**词库里有的**字符串;界面新词需补进 `plugin/i18n`(官方语言包未覆盖的 H5 对话框/Aria Ops 新界面长描述,靠采集回流 + 人工补)。
- 动态拼接 / 变量插值文本、闭合 shadow DOM、跨源 iframe、canvas/图片内文字 —— 不翻译。
