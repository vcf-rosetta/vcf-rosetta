# vcf-rosetta — 官方插件要求、市场语言优先级、收费墙设计

> 状态:草案 v0.1 · 2026-06-19 · 配合 [HLD.md](HLD.md)

---

## A. 官方 Remote Plug-in 硬性要求(部署 / 注册)

> 这些是会**直接卡住部署**的强约束,需在第一步就满足。

| 项 | 要求 | 说明 |
|----|------|------|
| 插件形态 | 仅 remote plug-in | 9.0 废弃 local |
| 注册运行时 | Java 17+ | 运行注册工具的环境 |
| 协议 | 插件后端必须 **HTTPS** | `-pluginUrl` scheme 为 https |
| 证书主机名 | 证书 **subjectAltName** 必须含插件服务器主机名(RFC 2818) | 否则 vCenter 拒绝 |
| 证书指纹 | 注册时提供插件服务器证书 **SHA-256 thumbprint**(冒号分隔十六进制对) | thumbprint 不匹配 → 插件不显示(最常见故障) |
| 注册权限 | vCenter 管理员 | `-remote` + `-pluginUrl` |
| 兼容声明 | manifest 声明 9.0 / 9.1 | 验证矩阵两版各跑 |

**运维预案**
- 证书轮换会使 thumbprint 失效 → 必须重新注册;部署文档要写清流程
- 插件服务器需稳定可达(vSphere Client 直接从该 URL 拉 manifest/资源)

---

## B. 市场与语言优先级

9.0 移除的语言:**zh-CN、zh-TW、ko、de、it、pt-BR**。
按"企业虚拟化付费市场 × 已被官方放弃"的交集排序:

| 优先 | 语言 | 理由 |
|------|------|------|
| **P0** | 简体中文 zh-CN | 母语人口全球第一;中国市场大且当前无任何官方界面。**第一步目标** |
| **P1** | 德语 de-DE | DACH 是欧洲最大企业 IT 市场,付费意愿高,亦被砍 |
| P2 | 韩语 ko / 繁中 zh-TW | 区域市场明确;zh-TW 可由 zh-CN 转换降低成本 |
| P3 | 意大利语 / 巴葡 | 视需求再评估 |

**架构要求**:新增语言 = 加一个资源包 + 词表,不改代码路径。德语作为第一个"多语言可复制性"验证目标。

---

## C. 收费墙(License / Paywall)设计

### C.1 前置约束:必须离线优先
VMware 企业客户大量为 **air-gapped(隔离网)**;Broadcom 自家 VCF 9.0 许可都支持断网模式 +
每 180 天离线用量上报。因此收费墙**不能依赖联网激活**,否则丢掉最大客户群。

### C.2 核心机制

| 机制 | 设计 |
|------|------|
| 许可形态 | **离线签名 License 文件**,我方私钥签名,插件服务器内置公钥校验 |
| 绑定 | **node-locked 到 vCenter instance GUID**(注册时本就需要拿到该 GUID) |
| 许可内容 | tier / 主机或插槽数配额 / 到期日 / 客户 ID / 签发时间 |
| 强制点 | **服务端 BFF**,绝不在前端 |
| 失败行为 | **软降级到免费层 + 宽限期**,绝不硬锁 vCenter 视图 |
| 用量上报 | 模仿 VCF 180 天离线报告,做合规可审计而非 DRM |

> **为什么强制点在服务端**:插件前端跑在沙箱 iframe、可被审查,任何前端 gating 等于无效。
> 功能开关与配额必须在我方控制的 plug-in server 判定。

> **为什么软降级**:基础设施工具一旦"锁死客户"则信任崩塌。许可过期/无效 → 退回免费层,
> 给宽限期,绝不让用户的 vCenter 页面打不开。

### C.3 分层(对齐三阶段路线)

| 层 | 内容 | 阶段 |
|----|------|------|
| **免费** | 中文界面翻译(拉新;纯翻译难单独收费) | 第一步 |
| **付费** | 中文语义层(告警解释 / 根因 / Runbook)、AI 助手、写操作 + 审批流、多 vCenter、**zh-CN 以外语言包**、企业支持 | 第二/三步 |

### C.4 计费模型
- 按**插槽 / 主机数 + 年度订阅**(对齐 VMware 自身计费习惯,采购方易理解)
- node-locked 到 vCenter GUID
- 多语言包可作为付费 add-on(zh-CN 免费引流,de/ko 等收费)

### C.5 现实边界
- on-prem 无法 100% 防盗版;目标是**企业合规可审计**,不是完美 DRM
- 重点投入:签名校验稳健性、软降级体验、离线激活流程顺畅

### C.6 待确认
- [ ] License 文件 schema 与签名算法选型
- [ ] 离线激活的用户操作流(插件设置页上传 license → 服务端校验)
- [ ] 宽限期时长与降级行为的精确定义
- [ ] 是否走 VMware Marketplace / 合作伙伴渠道分发(各有其商务条款)

---

## D. 参考

- [vSphere Client Plug-in Registration Tool](https://techdocs.broadcom.com/us/en/vmware-cis/vsphere/vsphere-sdks-tools/8-0/developing-remote-plug-ins-with-the-vsphere-client-sdk-8-0/creating-a-remote-plug-in-for-the-vsphere-client/vsphere-client-plug-in-registration-tool.html)
- [Find the SSL Thumbprint and GUID of vCenter Server](https://techdocs.broadcom.com/us/en/vmware-cis/vsphere/vsphere-sdks-tools/8-0/developing-remote-plug-ins-with-the-vsphere-client-sdk-8-0/using-the-vsphere-client-remote-plug-in-sample/find-the-ssl-thumbprint-and-guid-of-vcenter-server.html)
- [Get Thumbprint or Certificate of Remote Plug-in Server](https://techdocs.broadcom.com/us/en/vmware-cis/vsphere/vsphere-sdks-tools/8-0/developing-remote-plug-ins-with-the-vsphere-client-sdk-8-0/using-the-vsphere-client-remote-plug-in-sample/get-thumbprint-or-certificate-of-remote-plug-in-server.html)
- [Licensing in VMware Cloud Foundation 9.0 (air-gapped / disconnected mode)](https://blogs.vmware.com/cloud-foundation/2025/06/24/licensing-in-vmware-cloud-foundation-9-0/)
- [Understanding Air-gapped Site Licensing (HCX)](https://techdocs.broadcom.com/us/en/vmware-cis/hcx/vmware-hcx/4-9/vmware-hcx-user-guide-4-9/preparing-for-hcx-installations/hcx-activation-and-licensing/understanding-air-gapped-site-licensing-mode.html)
