# vcf-rosetta 术语词表(英→简体中文)

> 来源:前期 Chrome 翻译扩展的领域词典,经收编 / 合并 / 去重(原目录已弃用)。
> 机器可读完整词表见 [`plugin/i18n/`](../plugin/i18n/);本文件是核心术语 + 索引 + 用法。

## 规模

- **主词表**:12,813 条唯一英→中映射(`plugin/i18n/glossary.zh-CN.json`)
- **领域拆分**:73 个领域词典(`plugin/i18n/domains/`)
- **冲突待定稿**:628 条(`plugin/i18n/glossary.conflicts.json`)
- **项目补充**:核心缺口与校准(`plugin/i18n/glossary.supplement.zh-CN.json`)

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

## 用法约定

1. **取词以主词表为准,supplement 覆盖**:`glossary.zh-CN.json` → `glossary.supplement.zh-CN.json`。
2. **生产插件 i18n**:manifest 的 zh-CN 值,用本词表的规范译法填,保证用词一致。
3. **专有名词保留英文**:vSphere Client、vMotion、CPU、UUID、VMXNET3 等(词表中英文==中文即此类,非漏译)。

## 待办

- [ ] 审定 628 条冲突(如"映像/镜像""基准/基准线"),定稿并入 supplement
- [ ] 第一步插件视图取词时,核对核心术语表
