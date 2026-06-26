# vcf-rosetta 架构设计

> 状态:**早期设计快照**(2026-06-19)。本文档围绕 remote plug-in 形态,而该插件现已 ⏸️ 暂缓(见
> [`../plugin/README.md`](../plugin/README.md))。**实际出货形态是浏览器扩展**;最新架构以
> [`../browser-extension/README.md`](../browser-extension/README.md) 为准。本文留作设计留档。

## 1. 背景与目标

VCF 9.0 / 9.1 官方 UI 公开支持的语言为 English / Français / Español / 日本語,**无中文入口**。
目标:为中文(及后续其他语言)运维人员提供本地化的 VCF 运维界面,**首发简体中文**,主战场 vCenter + Aria Operations。

## 2. 关键决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 形态 | vSphere Client **remote plug-in**(非 local plug-in) | 9.x 官方推荐;进程隔离,不污染宿主 |
| 是否做独立 Web App | **否** | 浏览器自带翻译已覆盖只读阅读需求;独立 App 维护成本高 |
| 是否替换宿主语言包 | **否** | 平台未公开支持 `zh-CN` locale,配错 localization bundle 会导致插件部署异常 |
| 语言范围 | VCF9 原生 en/ja/es/fr 不做;补已放弃的 zh-CN/zh-TW/de/it/ko(zh-CN 审定) | 中文为第一目标 |
| 语言选择来源 | 插件**自行**判定(读浏览器语言 → fallback) | 不依赖宿主是否识别 `zh-CN` |

## 3. 范围边界

- ✅ 插件自身页面、按钮、表格、告警说明、对象详情的本地化
- ✅ **中文运维语义层**:告警解释、术语统一、操作建议(价值核心,不只是翻译界面)
- ❌ vCenter 宿主导航 / 系统菜单 / 原生页面的中文化
- ❌ 官方语言包注册或替换

## 4. 组件

```
┌─────────────────────────────────────────────┐
│  vSphere Client (宿主 UI, 英文)               │
│  └─ vcf-rosetta remote plug-in (中文 UI)     │
│       ├─ 资产总览 / 中文搜索                   │
│       ├─ 对象详情(vCenter 状态 + Aria 健康分)│
│       └─ 中文告警解释                          │
└──────────────────┬──────────────────────────┘
                   │ 经后端聚合层(不直连产品 API)
                   ▼
   ┌──────────────────────────────────────┐
   │ Aggregation Layer                     │
   │  · vSphere Automation API             │
   │  · VCF Operations (Aria Ops) API      │
   │  · (后续) Aria Ops for Networks/Logs  │
   └──────────────────────────────────────┘
```

## 5. i18n 设计原则(保守)

- 双资源包 `en-US` / `zh-CN`,key 一一对应,**严格 fallback** 到 en-US
- 术语词表统一(Cluster=集群,Datastore=数据存储,Alarm=告警,Symptom=症状,Recommendation=建议操作)
- i18n 清单与 key 在第一版必须完整,缺 key 不得导致渲染崩溃
- 语言切换:优先浏览器语言 → 未命中默认简体中文或英文

## 6. MVP 阶段划分

**阶段一**
- 资产总览(集群 / 主机 / VM / Datastore / 告警数)
- 中文搜索
- 中文告警解释
- 对象详情页(vCenter 状态 + Aria 健康分 + 最近异常事件)
- vCenter 插件跳转到中文详情页

**阶段二**:巡检中心 · 容量趋势 · 根因分析 · Runbook · 只读 AI 助手

**阶段三**:审批流 · 一键执行 · 变更留痕 · 细粒度 RBAC

## 7. 版本兼容

- 目标:vSphere Client SDK 9.0 / 9.1
- remote plug-in manifest 同时声明 9.0 / 9.1 兼容范围
- 验证矩阵:9.0 GA、9.1 GA 各跑一遍插件注册 + 渲染冒烟

## 8. 待确认 / 风险

- [ ] SDK 是否对插件内 locale 取值有白名单限制(release notes 曾提到平台新增 Italian,暗示 locale 受支持范围影响)
- [ ] Aria Operations API 鉴权方式与 vCenter SSO 的整合
- [ ] localization bundle 配错导致部署卡死的规避(保守 i18n 清单 + fallback)

## 9. 参考

- vSphere Client SDK / Remote Plug-in Sample
- vSphere Automation API
- VCF Operations API
- VMware Aria Operations for Networks API
- VCF 9.1 Release Notes
