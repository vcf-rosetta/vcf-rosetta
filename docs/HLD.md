# vcf-rosetta — 高层设计文档 (HLD)

> 状态:草案 v0.1 · 2026-06-19 · 主战场 vCenter + Aria Operations · 第一步:简体中文插件

---

## 1. 背景与立项依据

VCF / vCenter **9.0 起官方移除了多种语言本地化**,包括简体中文、繁体中文、韩语、德语、
意大利语、巴西葡语;**仅保留 4 种 locale**:

| locale | 语言 |
|--------|------|
| `en_US` | English |
| `es_ES` | Español |
| `fr_FR` | Français |
| `ja_JP` | 日本語 |

> 来源:vSphere Client SDK 9.0 Release Notes / Best Practices for Localization(见 §10)

**结论**:中文用户在 9.0/9.1 上已无官方界面。本项目通过 vSphere Client **remote plug-in**
重新为中文(首发简体)运维人员提供本地化界面与中文运维语义层。

---

## 2. 目标与非目标

### 目标
- 在 vSphere Client 9.0 / 9.1 内提供**简体中文**插件 UI(第一步)
- 覆盖 vCenter 核心运维只读视图 + Aria Operations 健康聚合
- 建立**中文运维语义层**:告警解释、术语统一、操作建议(价值核心,而非纯界面翻译)
- 架构上为 `zh-TW` 及其他语言的横向扩展预留

### 非目标
- ❌ 不替换 / 不注册 vCenter 宿主 UI 的官方语言包
- ❌ 不做 local plug-in(9.0 已废弃)
- ❌ 不做独立 Web App(浏览器自带翻译可覆盖只读阅读)
- ❌ 第一步不做写操作(电源/快照/迁移等),仅只读

---

## 3. 约束与既定事实(已核对官方文档)

| 项 | 事实 | 影响 |
|----|------|------|
| 插件形态 | 9.0 起**仅支持 remote plug-in** | 选型确定 |
| 注册运行时 | 扩展注册需 **Java 17+** | 部署环境需求 |
| 官方 sample 技术栈 | **Angular 19 + Clarity 17** | UI 选型(见 §5) |
| Manifest 格式 | `plugin.json`(取代旧 `plugin.xml`) | 配置格式 |
| 本地化资源 | manifest 声明 **resource list** → JSON 文件,key 为 locale,value 为 `{ 译文key: 译文 }` | i18n 机制(见 §6) |
| 受支持 locale | 宿主仅认 `en_US/es_ES/fr_FR/ja_JP` | **核心风险**:`zh-CN` 路由(见 §6.3 / §8) |

**既有资产**:字符库(官方文档检索得到的术语/字符串集合)已完成,作为 i18n 资源包的**输入源**。

---

## 4. 架构总览

```
┌───────────────────────────────────────────────────────────┐
│  vSphere Client 9.0/9.1 (宿主 UI,英文/4 语言之一)          │
│                                                            │
│   ┌──────────────────────────────────────────────────┐   │
│   │  vcf-rosetta Remote Plug-in (前端, Angular+Clarity) │   │
│   │   · 资产总览 / 中文搜索 / 对象详情 / 告警解释        │   │
│   │   · i18n runtime:locale 探测 + 资源包加载 + fallback│   │
│   └───────────────────────┬──────────────────────────┘   │
└───────────────────────────┼──────────────────────────────┘
                            │ HTTPS
                            ▼
   ┌────────────────────────────────────────────────────┐
   │  Plug-in Server (Java 17)                            │
   │   ├─ Manifest / 静态资源 (plugin.json + i18n JSON)   │
   │   ├─ Aggregation API(BFF,聚合 + 中文语义层)        │
   │   └─ 术语/告警解释引擎(查字符库 + 规则)             │
   └───────────────────────┬────────────────────────────┘
                           │ 不让前端直连产品 API
        ┌──────────────────┼───────────────────┐
        ▼                  ▼                   ▼
  vSphere Automation   VCF Operations      (后续) Aria Ops
       API              (Aria Ops) API      for Networks/Logs
```

**分层职责**
- **前端插件**:渲染、locale 探测、调用 BFF;不含业务逻辑、不存凭据
- **Plug-in Server**:托管 manifest + i18n 资源;BFF 聚合多产品 API;承载中文语义层
- **聚合层**:统一封装 vCenter / Aria Ops API,按用户与资源二次鉴权

---

## 5. 关键技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 插件类型 | remote plug-in | 9.0 唯一选项 |
| 前端框架 | **Angular 19 + Clarity 17** | 对齐官方 sample 与 vSphere Client 原生观感;Clarity 自带 i18n |
| 后端 | Java 17(对齐注册运行时) | 与 SDK/注册工具同栈,降低环境分歧 |
| BFF 模式 | 前端不直连产品 API,统一走 server | 鉴权收敛、语义层注入、抗 API 版本漂移 |
| 认证 | 复用 vCenter SSO / 插件会话,**不自存凭据** | 安全(见 §9) |
| 语义层位置 | 服务端(查字符库 + 规则) | 可复用、可缓存、便于多语言扩展 |

---

## 6. 本地化设计(核心)

### 6.1 资源包结构
manifest 的 resource list 指向一个 locale-keyed JSON:
```json
{
  "en": { "cluster": "Cluster", "alarm": "Alarm", "symptom": "Symptom" },
  "zh-CN": { "cluster": "集群", "alarm": "告警", "symptom": "症状" }
}
```
- 首发两套:`en` + `zh-CN`,key 一一对应
- 来源:既有**字符库**导出 → 校对 → 生成资源包

### 6.2 术语统一(节选)
| EN | zh-CN |
|----|-------|
| Cluster | 集群 |
| Datastore | 数据存储 |
| Alarm | 告警 |
| Symptom | 症状 |
| Recommendation | 建议操作 |
> 完整词表后续落 `docs/glossary.md` / `plugin/src/i18n/`

### 6.3 locale 探测与 fallback(关键策略)
宿主只认 4 个 locale,**不能依赖宿主把 `zh-CN` 传给插件**。因此 locale 判定在插件内自行完成:

```
1. 读插件自存的用户偏好(若有)
2. 否则读浏览器 navigator.language
3. 命中 zh* → 加载 zh-CN 资源
4. 未命中 → fallback en
5. 任一 key 缺失 → 单 key fallback en(严格,不得渲染崩溃)
```

### 6.4 保守 i18n 清单(防部署事故)
- 第一版 i18n 清单与 key **必须完整**,缺包/缺 key 走 fallback,绝不抛错卡部署
- 资源包随插件版本一起发布,避免运行期拉取失败

---

## 7. 阶段规划

| 阶段 | 目标 | 交付 |
|------|------|------|
| **第一步(本期)** | **简体中文插件** | remote plug-in 脚手架 + `en`/`zh-CN` 资源 + 只读 MVP 视图 + 在 9.0/9.1 注册渲染 |
| 第二步 | 语义层加深 | 巡检中心 · 容量趋势 · 根因分析 · Runbook · 只读 AI 助手 |
| 第三步 | 写操作 + 多语言 | 审批流 · 一键执行 · 变更留痕 · RBAC · `zh-TW` 及其他语言 |

---

## 8. 第一步详细范围 —— 简体中文插件

### 8.1 功能(全部只读)
1. **资产总览**:集群 / 主机 / VM / Datastore 计数 + 告警数
2. **中文搜索**:按 VM / 主机 / 集群 / 告警检索
3. **中文告警解释**:英文告警名 → 症状 + 可执行的中文建议
4. **对象详情页**:vCenter 状态 + Aria Ops 健康分 + 最近异常事件
5. **上下文跳转**:从 vCenter 对象页进入对应中文详情

### 8.2 工程交付物
- `plugin/manifest/plugin.json`(声明 9.0+9.1 兼容、resource list)
- `plugin/src/`(Angular 19 + Clarity 17 视图 + i18n runtime)
- `plugin/src/i18n/{en,zh-CN}.json`(由字符库生成)
- `server/`(Java 17:manifest 托管 + BFF 聚合 + 告警解释)
- 注册脚本 + 9.0 / 9.1 注册渲染冒烟

### 8.3 验收标准
- [ ] 插件在 9.0 GA、9.1 GA 均成功注册并渲染
- [ ] 默认中文环境下 5 个视图全中文,无 key 缺失/崩溃
- [ ] 切回 en 环境正确 fallback
- [ ] 告警解释覆盖 Top-N 常见告警
- [ ] 全程只读,无任何写 API 调用

---

## 9. 安全

- 不自存 vCenter 凭据;复用 SSO / 插件会话令牌
- BFF 代理调用产品 API,按用户 + 资源二次鉴权
- 错误信息不泄露内部细节;服务端记录详细上下文
- 输入校验在 BFF 边界完成(搜索词、对象 ID)

---

## 10. 风险与待确认

| # | 风险 | 严重度 | 缓解 |
|---|------|--------|------|
| ~~R1~~ | ~~宿主移除 `zh-CN` 后,vSphere Client 是否仍渲染插件自带 zh-CN~~ | ✅ **已验证消除** | **2026-06-22 在 VCF 9.1(vc.example.com)实测通过**:remote plugin 自带 zh-CN 可部署,宿主渲染 manifest i18n 中文标签,iframe 内中文正常,`navigator.language=zh-CN`。详见 [R1-POC.md](R1-POC.md)。结论:项目前提技术成立。 |
| R2 | localization bundle 配错导致插件部署卡死(历史 release notes 有先例) | 中 | 保守 i18n 清单 + 严格 fallback(§6.4) |
| R3 | Aria Ops API 鉴权与 vCenter SSO 整合 | 中 | 第一步先打通 vCenter,Aria 健康分可分期接入 |
| R4 | Java 17 注册环境依赖 | 低 | 部署文档明确前置条件 |

**待确认(需真机/SDK 验证)**
- [x] ~~插件自定义 locale(`zh-CN`)的实际渲染行为(R1)~~ → ✅ 9.1 实测通过(见 R1-POC.md)
- [x] ~~`plugin.json` 精确 schema~~ → ✅ 已由 9.1 真机确定:`manifestVersion 1.2.0` + `definitions.i18n.definitions[key][locale]`,locale 用 `zh-CN`(见 R1-POC §踩坑)
- [ ] 9.0 GA 上复测(目前在 9.1 验证;9.0 待补)
- [ ] 生产插件 Angular+Clarity SDK 引导(htmlClientSdk 在极简 iframe 中为 false)
- [ ] Clarity 17 i18n 与插件自管 locale 的协同方式

---

## 11. 参考

- [vSphere Client SDK 9.0 Release Notes](https://techdocs.broadcom.com/us/en/vmware-cis/vsphere/vsphere-sdks-tools/9-0/release-notes/vsphere-client-sdk-90-release-notes.html)
- [Best Practices for Localization (9.0)](https://techdocs.broadcom.com/us/en/vmware-cis/vsphere/vsphere-sdks-tools/9-0/developing-remote-plug-ins-with-the-vsphere-client-sdk-8-0/best-practices-for-vsphere-client-remote-plug-ins/best-practices-for-localization.html)
- [Developing Remote Plug-ins with the vSphere Client SDK](https://techdocs.broadcom.com/us/en/vmware-cis/vsphere/vsphere-sdks-tools/8-0/developing-remote-plug-ins-with-the-vsphere-client-sdk-8-0.html)
- [Remote Plug-in Architecture in the vSphere Client](https://vdc-repo.vmware.com/vmwb-repository/dcr-public/1cad846e-1b2f-406f-ba81-34bd77d9bad9/dfb037cd-ff63-4d5e-b432-9a4aa790168f/doc/GUID-4752D36B-5418-4EE7-B854-D8A1CB2C5F7D.html)
- vSphere Automation API · VCF Operations API · Aria Operations for Networks API
