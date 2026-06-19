# vcf-rosetta

为 VMware Cloud Foundation (VCF) 9.0 / 9.1 提供**多语言 UI 插件**。VCF 9 官方 UI 当前仅公开支持
English / Français / Español / 日本語,没有中文入口。本项目通过 vSphere Client **remote plug-in**
为运维人员提供本地化界面与中文运维语义层(告警解释、术语统一、对象详情聚合)。

> 罗塞塔石碑(Rosetta Stone)是多语言对照的经典符号 —— 取此名意在"让 VCF 说更多语言"。

## 范围

- **首发语言**:`en-US` + `zh-CN`(简体中文)
- **后续**:`zh-TW`(繁体中文)及其他语言
- **主战场**:vCenter,其次 Aria Operations(VCF Operations)

## 不做什么(重要边界)

- ❌ 不替换 / 不注册 vCenter 宿主 UI 的官方语言包(平台未公开支持 `zh-CN` locale,风险高)
- ❌ 不做独立 Web App(浏览器自带翻译已能覆盖此需求 —— 见 [docs/architecture.md](docs/architecture.md))
- ✅ 只做插件自身页面、术语层、上下文桥接的本地化

## 目录

| 目录 | 内容 |
|------|------|
| [`plugin/`](plugin/) | vSphere Client remote plug-in 源码 |
| [`docs/`](docs/) | 架构与设计文档 |

## 状态

🚧 设计阶段 — 见 [docs/architecture.md](docs/architecture.md)
