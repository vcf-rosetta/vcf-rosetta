# 英译德翻译简报 — VCF / vSphere 界面串

批次机翻的**唯一权威口径**。所有批次(自己做的、agent 做的)都按这份执行。
规则不是凭感觉定的,每一条后面的数字都是从 `plugin/i18n/glossary.de.json`(39,008 条已发布德语词条)
里数出来的,或是前面批次实测踩坑后固化的。

## 0. 工作方式

在批次文件里**原地填值**:键完全不变,只把空字符串填成德语。
旁边的 `.ref.json` 是中文参考。

> **中文参考只能用于理解语义,绝不能用来判断词性。**
> 实测:6/6 翻错的短标签,中文犯同样的错或有同样歧义 —— 中文词条本身是同一无上下文流程产出的,
> 错误相关而非独立。跟着中文走会原样复制同一个错。

## 1. 产品/组件名保持英文

NSX · vSphere · vSAN · vCenter · ESXi · ESX · VCF · vMotion · vLCM · Supervisor · Orchestrator ·
Fault Tolerance · Chargeback · Super Metric · Global Manager · VMware ·
Aria · SDDC · Tier-0 · Tier-1 · vApp · VMware Tools · Single Sign-On · Active Directory ·
Storage DRS · Network I/O Control · Storage I/O Control · Express Storage Architecture ·
Workspace ONE · Stretched Cluster (145/154) · Snapshot (292/292) · Site (114:19) · Depot (62)

CPU 指令集名(AVX512*、SMAP/SMEP)、硬件型号(AMD Turion、E1000E)、事件 ID、日志级别常量、
HTTP 方法、配置键(`logHost`、`UserVars.*`)一律原样保留。

> ### ⚠️ Load Balancer 不在保护名单里(2026-09-03 修正)
> 初版把 `Load Balancer` 列入 E4 强制保留,**是错的**。按词边界审计三份 glossary:
> 德 0% / 意 0% / 韩 0% —— 三语都翻(`Lastausgleichsdienst` / `bilanciamento del carico` / `로드 밸런서`),
> 证据包括 `Load balancer not found.` / `Empty load balancer name.` 这类明确指**对象**的串。
> E4 是硬错误,所以这条错误的规则**强制所有批次产出了错误译文**(德语 29 条、意语 12 条,已修正)。
> 仍保留英文的只有产品名:`Avi Load Balancer` · `NSX Advanced Load Balancer` · `Foundation Load Balancer`。

## 2. Distributed 的拆分 —— 别搞反

**保留英文**(产品名):`Distributed Switch` · `Distributed Virtual Switch` ·
`Distributed Power Management` · `Distributed Resource Scheduler` · `Distributed Logical Router`

**要翻**(普通名词):`Distributed Port Group -> Verteilte Portgruppe` ·
`Distributed Firewall -> Verteilte Firewall` · `distributed port -> verteilter Port`

依据:库内 345/425 的 "distributed" 保留是产品名带来的;滤掉产品名后剩 92 条普通名词用法一致译 *verteilt*。
一致性检查器会把这对报成分歧,**属预期,别去"修"**。

## 3. 占位符原样保留

`{name}` `[data.x]` `%(0)s` `%s` `{0}` —— 一个都不能丢、不能改写。审核项 E3 会拦。

## 4. 已裁定术语(直接用,不要另创)

```
Datastore -> Datenspeicher (993:73)     Datastore Cluster -> Datenspeicher-Cluster (64/66)
Heartbeat Datastore -> Taktsignal-Datenspeicher (11/11)
Datacenter -> Datencenter               Rebalancing -> Neuverteilung
Malicious -> bösartig                   Image -> Image (484:2,保留英文)
Passphrase -> Kennwortsatz              Workload Domain -> Arbeitslastdomäne
Virtual Private Cloud -> Virtuelle private Cloud   ← 翻,不保留英文(zh-CN/zh-TW 先例)
Compliance -> Konformität (119:66)      Timeout -> Zeitüberschreitung
Admission Control -> Zugangssteuerung   Access Control -> Zugriffssteuerung  ← 不是一回事
Privileges -> Rechte (62:16)            Permissions -> Berechtigungen
Override -> Überschreibung (66:34)      Overview -> Überblick   Summary -> Übersicht
Remediation -> Standardisierung         Precheck -> Vorabprüfung
Inventory -> Bestandsliste  Shares -> Anteile  Alert -> Warnung  Alarm -> Alarm
Wizard -> Assistent  Content Library -> Inhaltsbibliothek  Support Bundle -> Support-Paket
Certificate Authority -> Zertifizierungsstelle    Distinguished Name -> Eindeutiger Name
Maintenance Mode -> Wartungsmodus       Host Profile -> Hostprofil
Storage Policy -> Speicherrichtlinie    Baseline Group -> Baselinegruppe (不带连字符)
Witness Host -> Zeugenhost  Disk Group -> Datenträgergruppe  Counter -> Indikator (58:5)
Power State -> Betriebszustand  Transport Node -> Transportknoten  Drift -> Abweichung
Ephemeral -> flüchtig  Compute -> Computing-  Lifecycle(通用) -> Lebenszyklus
Template -> Vorlage  Troubleshooting -> Fehlerbehebung  Tenant -> Mandant
Fault Domain -> Fehlerdomäne  Plug-In -> Plug-In (103:6)  Upgrade -> Upgrade (504/655)
Engine -> Engine (20/20)  credentials -> Anmeldedaten (70:6)  Tier -> Schicht
Namespace -> Namespace  Uplink -> Uplink  Quota -> Kontingent  Thumbprint -> Fingerabdruck
Quiescing -> Stilllegung  Key Provider -> Schlüsselanbieter
Identity Provider -> Identitätsanbieter  Replication -> Replizierung
Recommendation -> Empfehlung  Policy -> Richtlinie  Accounts -> Konten
Guest -> Gast  Guest OS -> Gastbetriebssystem  Acknowledge -> Bestätigen
Severity -> Schweregrad  Decommission -> außer Betrieb nehmen  Deny -> Verweigern
Draft -> Entwurf  Dead -> Ausgefallen
```

### 两个术语按语境分裂 —— 别用全局规则

**Health:**
```
vSAN health / health check / health finding -> Integrität     (188:9 / 59:2 / 16:0)
health status                               -> Systemzustand  (45:17,反过来)
health monitor (NSX LB 探测对象)            -> Integritätsmonitor
```
> 注意:库内 `health monitor` 有 23/27 用 *Systemüberwachung*,但那 23 条全是
> **vSAN Skyline Health** 界面,与 NSX 负载均衡器的 health monitor **对象**不是一回事。
> 别跟那个频次。这条实测让三个批次各写各的(Systemzustandsmonitor / Integritätsmonitor / Systemüberwachung)。

**Disk:**
```
vSAN / disk group / cache tier / capacity tier 语境 -> Datenträger  (989:59)
其它语境                                            -> Festplatte   (905:571)
```
> 这也解释了为什么 `Disk Group -> Datenträgergruppe` 而普通磁盘用 Festplatte ——
> 不是不一致,是语境不同。

## 5. 查库必须看频次,不能只看单条

库里有离群值。单条 `glossary.de["X"]` **实测三次给出错误答案**:

| 单条查到 | 实际频次 | 正解 |
|---|---|---|
| `Image -> Abbild` | 484 : 2 | **Image** |
| `Datastore Cluster -> Datastore-Cluster` | 64 : 66 | **Datenspeicher-Cluster** |
| `Compliance -> Übereinstimmung` | 119 : 66 | **Konformität** |

```bash
node -e 'const de=require("/Users/zw/testany/myskills/vcf-rosetta/plugin/i18n/glossary.de.json");
const h=Object.entries(de).filter(([k])=>/YOUR_TERM/i.test(k));
console.log("n="+h.length); h.slice(0,10).forEach(([k,v])=>console.log(k.slice(0,60)," -> ",v.slice(0,70)))'
```

## 6. 德语 UI 惯例

动作/按钮用不定式(`Cluster hinzufügen`,不是 `Füge Cluster hinzu`);说明性长句用 Sie 敬语;
名词大写;英德混合复合词用连字符(`NSX-Projekt`、`Edge-Cluster`)。

## 7. 短标签(<=20 字符)的动名歧义 —— 错误率最高的一类

实测短串错误率 **25%**,长句 8%。根因只有一个:英文短标签没上下文,动名同形分不清。
三个原型错误:

```
Update Settings   错 "Einstellungen aktualisieren"(动词:更新这些设置)
                  对 "Update-Einstellungen"       (名词:更新设置项)
Capacity tabs     错 "Kapazitätsregisterkarten"   (容量的选项卡)
                  对 "Registerkarten „Kapazität“" (名为"容量"的选项卡)
Inbound Accept    错 "Eingehend akzeptieren"      (漏了宾语)
                  对 "Eingehende Pakete akzeptieren"
```

**怎么判**:① 查库找同族先例(最可靠 —— 英文首词是动词 Change/Check/Configure 时德语用动词短语,
是名词/形容词 Access/Advanced 时用复合名词);② 看同批次相邻键(按字母序排,常同属一个界面区域);
③ **实在判不出就在报告里列出来,不要硬猜** —— 那份清单是人工复核的入口。

## 8. 完成标准

每个文件跑到 **0 error**:

```bash
node contrib/check-batch.mjs contrib/incoming/de/batches/<file>.json de
```

W3(术语偏离)逐条查库核实。它从 glossary 现算主流译法,**但有已知误报,不要盲从**:

| 模式 | 例子 |
|---|---|
| ① 术语只作为更大专名的一部分出现 | `Enterprise->"linux"`(Red Hat/SUSE Enterprise Linux) · `Authority->"authority"`(Trust Authority) · `Lifecycle->"lifecycle"`(vSphere Lifecycle Manager) · `Networks->"netzwerke"`(Operations for Networks) · `Guide->"mware"`(VMware Compatibility Guide) · `Directory Service->"directory"`(Active Directory) |
| ② 同形异义 | `Transit->"daten"`(data-**in-transit** encryption,与 NSX Transit Gateway 无关) · `Depth->"warteschlangentiefe"`(queue depth) · `Switch->"switch"`(名词 Switch vs 动词 switch to) · `Maintenance->"wartungsmodus"`(maintenance **mode** vs site maintenance) |
| ③ 德语屈折 | 属格 `-s` · 复合词吃掉词尾 `-e`(Adresse → Adressbereich) |
| ④ 动词形误报 | `Queries->"fragt"` · `Controls->"steuert"`(API 描述里的 `Steuert die …`) |

W1(译文与英文相同)只在确实是专名/字面量时可接受。

## 9. 交付

只改指派给你的 JSON 文件,别动仓库其它东西,**别 git commit**。
报告:每文件条数与 error/warn 数、采纳/驳回了哪些 W3 及理由、
**以及所有你判不准词性或术语无库内依据的条目(单独列一节)**。
