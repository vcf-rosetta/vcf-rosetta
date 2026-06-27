# vcf-rosetta

为 VMware Cloud Foundation (VCF) 9.0 / 9.1 提供**中文(多语言)UI 本地化**。VCF 9 官方 UI 当前仅公开支持
English / Français / Español / 日本語,没有中文入口。本项目用**浏览器扩展**把 vCenter / VCF 控制台界面
实时翻译成中文(及更多语言),纯前端、不改 vCenter 服务器。

> 罗塞塔石碑(Rosetta Stone)是多语言对照的经典符号 —— 取此名意在"让 VCF 说更多语言"。

## 两个交付物(主次分明)

| | 交付物 | 角色 | 状态 |
|---|---|---|---|
| **主线** | [`browser-extension/`](browser-extension/) | 翻译 vCenter / VCF / Aria Operations **原生界面**(DOM 实时替换),按需下载语言包 | ✅ 已发布 v3.4.20,持续迭代 |
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
- ✅ 词典按需从公开数据仓库 [`vcf-rosetta/langpacks`](https://github.com/vcf-rosetta/langpacks) 经 jsDelivr 下载并本地缓存

## 目录

| 目录 | 内容 |
|------|------|
| [`browser-extension/`](browser-extension/) | **主线** 浏览器扩展(Chrome/Edge);打包、上架物料见其内 `scripts/` 与 `store/` |
| [`plugin/`](plugin/) | (可选)vSphere Client remote plug-in 源码;部署见 [docs/DEPLOY-linux.md](docs/DEPLOY-linux.md) |
| [`plugin/i18n/`](plugin/i18n/) | 术语词库(英→5 种语言),扩展据此构建词典(活跃核心;虽在 `plugin/` 下但**不随插件暂缓**) |
| [`contrib/`](contrib/) | 社区词条回流(扩展一键采集 → Issue/邮件 → 合并) |
| [`docs/`](docs/) | 架构、部署、Aria Ops 方案等文档 |

## 打包扩展(两种)

```bash
node browser-extension/build-dict.mjs                       # 生成 dict.*.json
node browser-extension/scripts/pack-store.mjs               # 轻量包(~28KB):联网时按需从 CDN 下词典
node browser-extension/scripts/pack-store.mjs --offline     # 离线包(~2MB):词典内置,隔离网/客户现场零联网可用
```
- **联网**:装轻量包 → 弹窗选语言 → 自动下载并缓存对应词库。
- **离线**:装离线包(`-offline.zip`)→ 词典已内置,选语言即用,无需任何外网。

## 状态

- 扩展:**v3.4.20** 已发布;界面默认英文(切到中文才显示中文 UI);覆盖 5 种语言(简体中文 / 繁體中文 / 德文 / 意大利语 / 韩语),词库 48k+ 条;一键添加/移除站点;关于页;轻量/离线两种打包
- 插件:POC,暂缓部署

## 许可证

[Apache License 2.0](LICENSE)。开发团队:Tony Yuan <mycloud2015@126.com>、Jingsong Yang <yjs@tanzu.eu.org>、Wei Zhou <zhouwei008@gmail.com>。Bug、翻译纠错、优化建议或新增语言需求欢迎联系。
