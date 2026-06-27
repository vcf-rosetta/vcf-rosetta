# browser-extension — VCF / vCenter UI 多语言翻译

把 **VMware vCenter / VCF 9.x / Aria Operations(VCF Operations)的原生 Web 控制台 UI 实时翻译**
为所选语言的浏览器扩展(Chrome/Edge MV3),完全在浏览器侧工作,**不修改 vCenter 服务器、不上传任何业务数据**。
翻译由 [`plugin/i18n/`](../plugin/i18n/) 的术语词库(zh-CN **50,401 条**:官方 + 审定)驱动。

> 为什么用浏览器扩展而非 vSphere 远程插件:远程插件跑在沙箱 iframe 里,只能翻自己的视图,
> **碰不到 vCenter 宿主 UI**;浏览器扩展有整页访问权,**能翻译整个原生界面**——这才是"让 VCF 变中文"的载体。
> 远程插件(`../plugin/`)是另一条线、⏸️ 暂缓的 POC,不参与界面汉化。

## 语言范围(重要)

VCF 9 原生只公开支持 **4 种**界面语言:English / 日本語 / Español / Français —— 这 4 种用户在 VCF 9 里
直接切即可,**本扩展不为其制作翻译包**。本扩展只补 VCF 9 **已放弃**、不再原生提供的语言:

| 语言 | code | 来源 |
|------|------|------|
| 简体中文 | `zh-CN` | 官方 + 审定(curated,50,401 条) |
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

## 🔁 更新词典(已经装过的人**必看**)

词库更新后,**只 `git pull` 不会让你的扩展变新**——因为 `dict.*.json` 是 gitignore 的构建产物,**不在仓库里**,`pull` 只更新词库源(`glossary` / `domains`)。少跑一步,字典永远是旧的。

**正确顺序(缺一不可):**

```bash
git pull                                  # ① 拉最新词库源(不含 dict)
node browser-extension/build-dict.mjs     # ② ★从最新词库重建 dict.<locale>.json —— 最容易漏的一步
```

③ **Chrome 里「重新加载」扩展**(不是刷新页面!):
`chrome://extensions` → 找到 VCF Rosetta → 点 **↻ 重新加载** → 回 vCenter **硬刷新**(Cmd/Ctrl+Shift+R)。

> ⚠️ Chrome「加载已解压」是在**加载那一刻**把文件读进内存的。你 `build-dict` 改了磁盘上的 `dict.zh-CN.json` 后,**必须点扩展的「重新加载」**才会重读新文件;光刷新网页没用。

**怎么确认成功**:打开弹窗看「词典」行的**条数**——变成最新条数(如 50,401)即已更新。
> 弹窗的 `v` 版本号对**内置**词典可能显示 `v0`(加载时机小瑕疵),**以条数为准**,不要看 v 号。

> 商店版 / 轻量包用户不需要 build:他们的词典从 CDN 按需下载,维护者 `publish-langpacks.sh` 发布后,弹窗点 **↻ 刷新词典** 即可重取。本节只针对**开发者模式/离线包**(词典内置)的更新。

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

## 📦 离线包:制作 + 导入安装(隔离网 / 客户现场零联网)

离线包把**最新词典内置**进扩展,装上选语言即用、**全程不联网**,适合内网隔离环境和客户现场。
> 目前**不发 GitHub Release**:`dist/` 不入库,离线包由维护者本地构建后,通过内网共享 / U 盘 / IM 发给使用者。

### A. 维护者:产出离线包

```bash
git pull                                                 # 取最新词库
node browser-extension/build-dict.mjs                    # 从 glossary 重建内置词典(★勿漏)
node browser-extension/scripts/pack-store.mjs --offline  # 产出 dist/vcf-rosetta-<版本>-offline.zip(~6MB)
```
产物在 `browser-extension/dist/vcf-rosetta-<版本>-offline.zip`(如 `vcf-rosetta-3.4.23-offline.zip`)。把这个 **zip 文件**发给使用者即可。

### B. 使用者:导入安装(Chrome / Edge,一步步)

1. **拿到并解压** `vcf-rosetta-<版本>-offline.zip` → 得到一个文件夹(如 `vcf-rosetta-3.4.23-offline/`)。
   > 放到一个**固定、不会删**的目录(扩展加载后会一直引用此文件夹,删了扩展就失效)。
2. 浏览器地址栏输入 **`chrome://extensions`**(Edge 是 `edge://extensions`)回车。
3. 打开右上角 **「开发者模式 / Developer mode」** 开关。
4. 点左上 **「加载已解压的扩展程序 / Load unpacked」** → 选**第 1 步解压出的文件夹**(里面有 `manifest.json` 那一层)。
   > ⚠️ 是选**解压后的文件夹**,不是 zip 本身;Chrome 的「加载已解压」不接受 zip。
5. 列表出现 **VCF Rosetta**、有图标即装好。打开 **vCenter / VCF / Aria Ops** 页面 → 点扩展图标 → **选「简体中文」** → 自动翻译。
6. **核对版本**:点扩展弹窗,「词典」行应显示 **`zh-CN · 50401 条 · 内置`**(条数对上即最新)。

### C. 使用者:升级到新离线包

1. 维护者给新 zip(版本号更大)→ 解压。
2. `chrome://extensions` → VCF Rosetta → 若覆盖原文件夹,点 **↻ 重新加载**;若解压到新目录,先「移除」旧的再「加载已解压」新文件夹。
3. 回 vCenter **硬刷新**(Cmd/Ctrl+Shift+R),弹窗核对条数已变新。

> 企业批量分发:也可用浏览器的 **ExtensionInstallForcelist / 组策略**指向打包好的扩展统一推送;离线/隔离网下用解压文件夹 + 开发者模式最简单。

## 配置(弹窗)

- **翻译语言**:即开关 —— 选 `English(原文)`=不翻译;选某语言=翻译。**没有独立的"启用"开关**(选语言即生效)。
- **强制启用的站点**:留空则自动识别(`/ui` 路径 / 标题含 vSphere、vCenter、SDDC Manager、Aria/VCF Operations、Log / Clarity 框架特征);可一键「添加/移除当前站点」。
- **收集未翻译词条**(默认关):浏览缺词页面后,一键导出 JSON / 贡献到 GitHub / 邮件回流(见 [`../contrib/`](../contrib/))。
- 切换语言或保存后**刷新页面**生效。

## 工作原理

- `translator.js` 递归遍历 DOM 文本节点 + 属性(placeholder/title/aria-label),命中词库即替换;
  **穿透 open shadow DOM 与同源 iframe**(VCF Operations 仪表板、数据网格列头都在 shadow DOM 里),并对每个 shadow root / iframe 单独挂 `MutationObserver`,跟踪 Angular SPA 路由与异步加载持续翻译。
- 清单设 `all_frames: true`:脚本**注入每个 frame、各自翻译**,因此**跨源/沙箱 iframe 内的 H5 插件面板**(vSAN 故障域、vLCM「更新」等)也能翻译——这类面板顶层遍历器够不到,曾是「左侧菜单中文、右侧面板英文」的根因。
- 跳过 `script/style/code/pre/textarea`,保留文本首尾空白。
- 采集与翻译共用同一遍历器:翻译器够得到的地方才能采集到缺词。

## 已知边界

- 只翻译**词库里有的**字符串;界面新词需补进 `plugin/i18n`(官方语言包未覆盖的 H5 对话框/Aria Ops 新界面长描述,靠采集回流 + 人工补)。
- 动态拼接 / 变量插值文本(部分由 `translator.js` 的受控模式 PHRASES 兜底,如容量明细、会话/空闲时长、计数行)、闭合 shadow DOM、canvas/图片内文字 —— 不翻译。
  > 跨源 iframe 已由 `all_frames: true` 覆盖(见上「工作原理」),不再是边界。
