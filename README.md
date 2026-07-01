# vcf-rosetta

为 VMware Cloud Foundation (VCF) 9.0 / 9.1 提供**中文(多语言)UI 本地化**。VCF 9 官方 UI 当前仅公开支持
English / Français / Español / 日本語,没有中文入口。本项目用**浏览器扩展**把 vCenter / VCF 控制台界面
实时翻译成中文(及更多语言),纯前端、不改 vCenter 服务器。

> 罗塞塔石碑(Rosetta Stone)是多语言对照的经典符号 —— 取此名意在"让 VCF 说更多语言"。

## 两个交付物(主次分明)

| | 交付物 | 角色 | 状态 |
|---|---|---|---|
| **主线** | [`browser-extension/`](browser-extension/) | 翻译 vCenter / VCF / Aria Operations **原生界面**(DOM 实时替换),按需下载语言包 | ✅ 已发布 v3.4.31,持续迭代 |
| 暂缓 | [`plugin/`](plugin/) | vSphere Client remote plug-in:嵌入 vCenter 的**中文运维助手面板**(告警解释 / 术语查询 / 资产概览)。**不翻译宿主界面** | ⏸️ POC/暂缓,代码保留,默认不部署 |

> **为什么插件暂缓**:它不参与界面汉化(那是扩展的事),增量价值仅在"中文运维语义层",目前还薄(告警解释 19 条),
> 且部署需在服务器跑服务 + 证书 + 注册到 vCenter。**当前主线只需扩展即可交付核心价值**。等运维语义层做厚再启用。

## 范围

- **语言**:VCF 9 原生支持 en/ja/es/fr 这 4 种(本项目不做);本项目只补 VCF 9 **已放弃**的 5 种 ——
  `zh-CN`(简体中文,审定)/ `zh-TW`(繁體中文)/ `de`(德文)/ `it`(意大利文)/ `ko`(韩文)
- **覆盖**:vCenter,以及 Aria Operations(VCF Operations)—— 把其地址加入扩展白名单即可翻译
- **缺词回流**:官方包未覆盖的新界面(H5 对话框、Aria Ops 仪表板)靠众包采集补全(见 [`contrib/`](contrib/))

## 不做什么(重要边界)

- ❌ 不替换 / 不注册 vCenter 宿主 UI 的官方语言包(平台未公开支持 `zh-CN` locale)
- ❌ 不向任何服务器发送页面内容,翻译全程在本地完成
- ✅ 词典按需从公开主仓库 [`vcf-rosetta/vcf-rosetta`](https://github.com/vcf-rosetta/vcf-rosetta) 经 jsDelivr 下载并本地缓存

## 目录

| 目录 | 内容 |
|------|------|
| [`browser-extension/`](browser-extension/) | **主线** 浏览器扩展(Chrome/Edge);打包、上架物料见其内 `scripts/` 与 `store/` |
| [`plugin/`](plugin/) | (可选)vSphere Client remote plug-in 源码;部署见 [docs/DEPLOY-linux.md](docs/DEPLOY-linux.md) |
| [`plugin/i18n/`](plugin/i18n/) | 术语词库(英→5 种语言),扩展据此构建词典(活跃核心;虽在 `plugin/` 下但**不随插件暂缓**) |
| [`contrib/`](contrib/) | 社区词条回流(扩展一键采集 → Issue/邮件 → 合并) |
| [`docs/`](docs/) | 架构、部署、Aria Ops 方案等文档 |

## 运行时架构(词典怎么来)

仓库**已公开**,不再拆单独的语言包数据仓库——词典 `dict.*.json` 直接随主仓库入库,
经 [jsDelivr](https://www.jsdelivr.com/) CDN 从主仓库分发:

```
浏览器扩展  ──①内置(离线包)──▶ 直接用
            ──②本地缓存─────▶ chrome.storage(版本一致)
            ──③CDN 按需下载─▶ cdn.jsdelivr.net/gh/vcf-rosetta/vcf-rosetta@main/browser-extension/dict.<lang>.json
```

- **轻量包 / 商店版**:包内不带词典(~63KB),选语言时走 ③ 从 CDN 下载并缓存。
- **离线包**:词典内置(~6MB),走 ①,**全程零联网**,适合隔离网 / 客户现场。

## 安装

> 📘 **图文安装/使用指南(多语言,含截图)**:[在线查看](https://raw.githack.com/vcf-rosetta/vcf-rosetta/main/docs/install-guide.html)
> · 源文件 [`docs/install-guide.html`](docs/install-guide.html)(单文件自包含,可离线打开;支持 en / 简体 / 繁體 / Deutsch / Italiano / 한국어 切换)

### 方式一:Chrome 应用商店(联网,推荐普通用户)

- Chrome Web Store:_(审核通过后补链接)_
- 装好 → 打开 vCenter / VCF / Aria Ops 页面 → 点扩展图标 → 选语言 → 自动翻译。

### 方式二:下载离线包手动安装(隔离网 / 客户现场 / 尝鲜)

1. 到 **[Releases](https://github.com/vcf-rosetta/vcf-rosetta/releases/latest)** 下载 `vcf-rosetta-<版本>-offline.zip`(词典内置,~6MB)。
2. **解压**到一个固定、不会删的目录(得到含 `manifest.json` 的文件夹)。
3. 浏览器打开 `chrome://extensions`(Edge 为 `edge://extensions`)→ 右上角开 **开发者模式**。
4. 点 **加载已解压的扩展程序 / Load unpacked** → 选**第 2 步解压出的文件夹**(不是 zip 本身)。
5. 列表出现 **VCF Rosetta** 即装好 → 打开 vCenter/VCF/Aria Ops → 点图标 → 选语言。
   > 核对:弹窗「词典」行显示 `zh-CN · 50401 条 · 内置` 即最新。

> 轻量包(`vcf-rosetta-<版本>.zip`,联网从 CDN 取词典)也随 Release 附带,供高级用户手动装;
> 详细的离线制作/升级/企业批量分发见 [`browser-extension/README.md`](browser-extension/README.md)。

## 从源码构建(维护者)

```bash
git clone https://github.com/vcf-rosetta/vcf-rosetta.git
cd vcf-rosetta
# dict.*.json 已随仓库入库,clone 即有;仅当改了词库源 glossary.*.json 才需重建:
node browser-extension/build-dict.mjs                       # 重建 dict.*.json
node browser-extension/scripts/pack-store.mjs               # 轻量包(~63KB):联网时按需从 CDN 下词典
node browser-extension/scripts/pack-store.mjs --offline     # 离线包(~6MB):词典内置,零联网可用
```

## 状态

- 扩展:**v3.4.31** 已发布;界面默认英文(切到中文才显示中文 UI);覆盖 5 种语言(简体中文 / 繁體中文 / 德文 / 意大利语 / 韩语),词库 50k+ 条;一键添加/移除站点;关于页;轻量/离线两种打包;离线包经 GitHub Releases 分发
- 插件:POC,暂缓部署

## 许可证

[Apache License 2.0](LICENSE)。开发团队:Tony Yuan <mycloud2015@126.com>、Jingsong Yang <yjs@tanzu.eu.org>、Wei Zhou <zhouwei008@gmail.com>。Bug、翻译纠错、优化建议或新增语言需求欢迎联系。
