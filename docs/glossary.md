# vcf-rosetta 术语词表(英→简体中文)

> 来源:前期 Chrome 翻译扩展的领域词典,经收编 / 合并 / 去重(原目录已弃用)。
> 机器可读完整词表见 [`plugin/i18n/`](../plugin/i18n/);本文件是核心术语 + 索引 + 用法。

## 规模

- **最终权威词表**:zh-CN **49,950 条**唯一英→中映射(`plugin/i18n/glossary.zh-CN.json`);另有 zh-TW/de/it/ko 各约 35–37k
- **领域拆分**:84 个领域词典(`plugin/i18n/domains/`)
- **审定覆盖**:634 条裁决(`plugin/i18n/glossary.overrides.zh-CN.json`),628 条冲突 ✅ 全部审定完成
- **冲突原始记录**:留档(`plugin/i18n/glossary.conflicts.json`)

## 核心运维术语(第一步插件 5 视图用)

| English | 简体中文 |
|---------|---------|
| Cluster | 集群 |
| Host | 主机 |
| Virtual Machine | 虚拟机 |
| Datastore | 数据存储 |
| Datacenter | 数据中心 |
| Resource Pool | 资源池 |
| Network | 网络 |
| Folder | 文件夹 |
| Alarm / Alarms | 告警 |
| Triggered Alarms | 已触发的告警 |
| Symptom | 症状 |
| Recommendation | 建议操作 |
| Event / Events | 事件 |
| Issue / Issues | 问题 |
| Health | 健康 |
| Capacity | 容量 |
| Severity | 严重程度 |
| Warning | 警告 |
| Critical | 严重 |
| Powered On / Off | 已开机 / 已关机 |
| Snapshot | 快照 |
| Migrate | 迁移 |
| Tag | 标记 |
| Monitor | 监控 |
| Summary | 摘要 |
| Overview | 概览 |
| Inventory | 清单 |
| Permissions | 权限 |
| Acknowledge | 确认 |
| Reset to Green | 重置为正常 |

## 领域词典(TOP 15,按词条数)

| 领域 | 词条数 |
|------|--------|
| 存储 / SRM / K8s (`vcf9-storage-srm-k8s`) | 400 |
| vSphere 权限 (`vcf9-vsphere-privileges`) | 393 |
| 网络安全进阶 (`vcf9-network-security-adv`) | 380 |
| 自动化 / 目录 / vLCM 权限 (`vcf9-automation-catalog-vlcm-perms`) | 375 |
| 舰队运维 (`vcf9-fleet-ops`) | 359 |
| 主机/网络/存储/库 (`vcf9-host-network-storage-library`) | 313 |
| Supervisor DFW (`vcf9-supervisor-dfw`) | 308 |
| VM 硬件/标记/高级 (`vcf9-vm-hardware-tags-advanced`) | 297 |
| Supervisor 命名空间 UI (`vcf9-supervisor-namespace-ui`) | 295 |
| 监控/身份/安全 (`vcf9-monitoring-identity-security`) | 284 |
| NSX LB / vSphere Replication (`vcf9-nsx-lb-vsphere-replication`) | 280 |
| VAMI/NIOC/网络 (`vcf9-vami-nioc-networking`) | 275 |
| DRS/HA/vApp/集群 (`vcf9-drs-ha-vapp-cluster`) | 272 |
| 表格列名 (`table-columns`) | 270 |
| NSX VPC 多租户 (`vcf9-nsx-vpc-multitenancy`) | 268 |

(完整 73 个领域见 `plugin/i18n/domains/`)

## 审定原则(冲突裁决依据)

- **移除/删除** = Remove/Delete;**故障转移** = Failover;**映像** = Image;**基准** = Baseline
- **标记** = Tag;**份额** = Shares;**入站/出站** = Ingress/Egress;**来宾+内省** = Guest/Introspection
- **软件库** = Depot;**专用** = Private;**账户** = Account;**详细信息** = Details;**身份验证** = Authentication
- **纳管/下架** = Commission/Decommission;纯缩写保留(BGP/MTU/APD…),生僻缩写带简注(SCIM/TEP…)
- 产品名保留原文(vSphere Replication / Traceflow / SRM…)

## 用法约定

1. **直接用 `glossary.zh-CN.json`**:已定稿,审定覆盖已应用,无需再合并。
2. **生产插件 i18n**:manifest 的 zh-CN 值,用本词表的规范译法填,保证用词一致。
3. **专有名词保留英文**:vSphere Client、vMotion、CPU、UUID、VMXNET3 等(词表中英文==中文即此类,非漏译)。

## 状态

- [x] 628 条冲突全部审定完成(见 `glossary.overrides.zh-CN.json`)
- [ ] 第一步插件视图取词时,核对核心术语表
- [ ] 随产品迭代补充新词条
