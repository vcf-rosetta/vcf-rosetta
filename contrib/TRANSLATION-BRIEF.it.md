# 英译意翻译简报 — VCF / vSphere 界面串

批次机翻的**唯一权威口径**。方法论与 `TRANSLATION-BRIEF.de.md` 相同,
但**术语表完全不同,绝不能照搬德语的**。

> ## 先看这个:德语的裁定在意大利语上会系统性翻车
>
> 同一个英文词,两种语言的处理经常**相反**。以下全部是从各自 glossary 数出来的:
>
> | 英文 | 德语 | 意大利语 |
> |---|---|---|
> | Datastore | **Datenspeicher**(翻)993:73 | **Datastore**(保留)1079:2 |
> | Image | **Image**(保留)484:2 | **Immagine**(翻)424:13 |
> | Timeout | **Zeitüberschreitung**(翻) | **Timeout**(保留)111:1 |
> | Stretched Cluster | **保留英文** 145/154 | **cluster esteso**(翻)149:2 |
> | Witness | **Zeugenhost**(翻) | **Witness**(保留)335:1 |
> | Upgrade | **Upgrade**(保留)504/655 | **Aggiornamento**(翻)510:10 |
>
> 六个词里六个方向相反。**每个术语都必须查 `glossary.it.json` 重新定,一个都不能从德语推。**

## 0. 工作方式

在批次文件里**原地填值**:键完全不变,只把空字符串填成意大利语。
旁边的 `.ref.json` 是中文参考。

> **中文参考只能用于理解语义,绝不能用来判断词性。**
> 实测(德语侧):6/6 翻错的短标签,中文犯同样的错或有同样歧义 —— 中文词条本身是同一
> 无上下文流程产出的,错误相关而非独立。意大利语同理。

## 1. 产品/组件名保持英文

NSX · vSphere · vSAN · vCenter · ESXi · ESX · VCF · vMotion · vLCM · Supervisor · Orchestrator ·
Fault Tolerance · Chargeback · Super Metric · Global Manager · VMware ·
Aria · SDDC · Tier-0 · Tier-1 · vApp · VMware Tools · Single Sign-On · Active Directory ·
Storage DRS · Network I/O Control · Storage I/O Control · Workspace ONE

**意大利语额外保留(与德语不同,库内证据):**
`Datastore` (1079:2) · `Snapshot` (360:0) · `Uplink` (149:0) · `Witness` (335:1) ·
`Guest` (470/470) · `Timeout` (96%) ·
`Plug-in` (50:0) · `Tenant` (4:0) · `Baseline`→见下(实为翻译) · `Distributed Switch` (304/305)

CPU 指令集名、硬件型号、事件 ID、日志级别常量、HTTP 方法、camelCase 配置键一律原样保留。

> ### ⚠️ Load Balancer 不在保护名单里(2026-09-03 修正)
> 初版把 `Load Balancer` 列入 E4 强制保留,**是错的**。按词边界审计三份 glossary:
> 德 0% / 意 0% / 韩 0% —— 三语都翻(`Lastausgleichsdienst` / `bilanciamento del carico` / `로드 밸런서`),
> 证据包括 `Load balancer not found.` / `Empty load balancer name.` 这类明确指**对象**的串。
> E4 是硬错误,所以这条错误的规则**强制所有批次产出了错误译文**(德语 29 条、意语 12 条,已修正)。
> 仍保留英文的只有产品名:`Avi Load Balancer` · `NSX Advanced Load Balancer` · `Foundation Load Balancer`。

## 2. Distributed 的拆分

`Distributed Switch` 保留英文(304/305)。`Distributed Port Group` 等普通名词用法要翻
(`gruppo di porte distribuite`)。查库确认每一处,别套德语的清单。

## 3. 占位符原样保留

`{name}` `[data.x]` `%(0)s` `%s` `{0}` —— 审核项 E3 会拦。

## 4. 已裁定术语(从 glossary.it 数出来的,直接用)

```
Datastore     -> Datastore (1079:2,保留)     Datacenter -> Datacenter (427:177)
Image         -> Immagine (424:13)           Compliance -> Conformità (234:1)
Health        -> Integrità (743:317)         Disk -> Disco/Dischi (1791/1003)
Privileges    -> Privilegi (130)             Permissions -> Autorizzazioni (69)
Template      -> Modello (131:9)             Wizard -> Procedura guidata (25)
Snapshot      -> Snapshot (360,保留)          Workload -> Carico di lavoro (72)
Overview      -> Panoramica (22)             Alert -> Avviso (55:9)
Port Group    -> Gruppo di porte (163)       Timeout -> Timeout (111:1,保留)
Recommendation-> Consiglio (41)              Remediation -> Correzione (272:4)
Namespace     -> Spazio dei nomi (65:4)      Uplink -> Uplink (149,保留)
Quota         -> Quota (18)                  Thumbprint -> Identificazione personale (31:3)
Key Provider  -> Provider di chiavi (105:4)  Identity Provider -> Provider di identità (11)
Replication   -> Replica (201)               Policy -> Criterio (594:85)
Shares        -> Condivisioni (62)           Inventory -> Inventario (79:6)
Support Bundle-> Bundle di supporto (26)     Certificate Authority -> Autorità di certificazione (6:1)
Host Profile  -> Profilo host (73)           Storage Policy -> Criterio di storage (106:4)
Fault Domain  -> Dominio di errore (111:8)   Witness -> Witness (335:1,保留)
Rebalance     -> Ribilanciamento / Ribilancia (93/103)
Upgrade       -> Aggiornamento (510:10)      Plug-in -> Plug-in (50,保留)
Compute       -> elaborazione / calcolo       Lifecycle(通用) -> ciclo di vita
              (Compute Resource -> Risorsa di elaborazione;compute policy -> criterio di calcolo)
Tenant        -> Tenant (4,保留)              Guest -> Guest (470/470,保留)
Override      -> Sostituzione (65)           Counter -> Contatore (65%,证据偏弱,遇到时再查)
Credentials   -> Credenziali (69)            Maintenance Mode -> Modalità di manutenzione (381)
Stretched Cluster -> cluster esteso (149:2)  ← 与德语相反,德语保留英文
Baseline      -> base di confronto           Depot -> archivio
Passphrase    -> frase d'accesso             Admission Control -> Controllo ammissione
Access Control-> Controllo degli accessi     Ephemeral -> Effimero
Drift         -> deviazione                  Transport Node -> nodo di trasporto
Power State   -> stato di alimentazione      Disk Group -> gruppo di dischi
```

> ### ⚠️ 本表的一处已知错误(2026-09-03 修正)
> 初版写 `Compute → Compute (460:99, 保留)`,**是子串匹配假象** —— `Compute` 匹配到了
> `Computer`,那 460 条「保留」全部来自 `Computer`。按**词边界**重算:`Compute` 词边界命中
> 128 条,保留英文只有 **6%**,实际一律翻译。
> 全表 20 条已按词边界复验,只有 `Compute` 严重失真、`Counter` 轻度失真,其余 18 条成立。
> **另一处同类问题:`Lifecycle` 词边界 96% 保留,但 206/222 是 *vSphere Lifecycle Manager* 专名;
> 排除专名后只剩 15 条、53% —— 通用义用 `ciclo di vita`,只有 `vSphere Lifecycle Manager` 保留英文。**
> **教训:查库统计必须用词边界,不能用子串** —— 这与第 5 节「看频次不看单条」是两条独立的坑,
> 都会给出自信但错误的答案。

## 4.5 缩写【不要】扩写 —— 意语 house style(2026-09-04 实测)

裸缩写保持原样:`SPBM` -> `SPBM`,**不要**写成 `SPBM (gestione basata su criteri di storage)`。

依据(三语对比,数的是「译文含括号而英文键不含」的比例):

| | 官方加括注率 | 裸缩写扩写 |
|---|---|---|
| 意大利语 | **0.08%** (30/38,813) | **0 次** |
| 德语 | 0.73% | 1 次(`NIC -> Netzwerkkarte (NIC)`) |
| 韩语 | 6.47% (2,518/38,923) | 0 次 —— 韩文技术文体本就常用 `DCUI(직접 콘솔 UI)` |

意语官方几乎从不加括注。扩写还会撑破窄列/徽章布局。
本轮据此回滚了 61 条(`short-047`~`short-058` 一整段字母序批次采用了扩写惯例)。
同批还带出大小写走样:`vSS` 被写成 `VSS`。

英文大写单词(非缩写)照常翻译:`SYSTEM -> SISTEMA`、`POLICY -> CRITERIO`、`SWITCHING -> COMMUTAZIONE`。

## 5. 查库必须看频次,不能只看单条 —— 而且必须用词边界

库里有离群值。德语侧实测**三次**被单条查询误导(`Image→Abbild` 实际 484:2 反向、
`Datastore Cluster`、`Compliance`)。意大利语同样风险。

```bash
node -e 'const it=require("/Users/zw/testany/myskills/vcf-rosetta/plugin/i18n/glossary.it.json");
const h=Object.entries(it).filter(([k])=>/YOUR_TERM/i.test(k));
console.log("n="+h.length); h.slice(0,10).forEach(([k,v])=>console.log(k.slice(0,60)," -> ",v.slice(0,70)))'
```

## 6. 意大利语 UI 惯例 —— 与德语结构不同

**动作/按钮用祈使式第二人称单数**,不是不定式:库内 `Aggiungi` 943 : `Aggiungere` 34。

```
Add Alias          -> Aggiungi alias
Add Capacity Disks -> Aggiungi dischi di capacità
Reset Settings     -> Reimposta impostazioni
```

**API/功能描述用第三人称单数**(库内并存,不冲突):

```
Add a host to a cluster -> Aggiunge un host a un cluster
```

其它:名词**不**大写(与德语相反);句首和专名才大写;复合概念用 `di` 连接
(`gruppo di porte`、`provider di chiavi`),不像德语那样黏成一个词。

## 7. 短标签(<=20 字符)的动名歧义 —— 错误率最高的一类

德语侧实测短串错误率 **25%**,长句 8%。根因是英文短标签没上下文,动名同形分不清。
意大利语在这一点上比德语**稍好**:祈使式 `Aggiungi` 和名词 `Aggiunta` 形态差别明显,
但 `Update Settings` 这类仍然两可(`Aggiorna impostazioni` 动 vs `Impostazioni di aggiornamento` 名)。

**怎么判**:① 查库找同族先例(最可靠);② 看同批次相邻键(按字母序排,常同属一个界面区域);
③ **实在判不出就在报告里列出来,不要硬猜** —— 那份清单是人工复核的入口。

## 8. 完成标准

每个文件跑到 **0 error**:

```bash
node contrib/check-batch.mjs contrib/incoming/it/batches/<file>.json it
```

W3(术语偏离)从 glossary 现算主流译法,**有已知误报,不要盲从**。
德语侧归纳出四类,机制与语言无关,意大利语同样适用:

| 模式 | 说明 |
|---|---|
| ① 术语只作为更大专名的一部分出现 | 如 `Lifecycle` 的证据全来自 *vSphere Lifecycle Manager* |
| ② 同形异义 | 如 `Transit` 的证据全是 *data-in-transit*,与 NSX Transit Gateway 无关 |
| ③ 屈折/搭配变化 | 意大利语的性数一致、冠词缩合(`dello`/`della`/`dei`)会让词干匹配失效 |
| ④ 动词形误报 | 库内 API 描述的第三人称形被当成术语 |

W1(译文与英文相同)只在确实是专名/字面量时可接受 —— 意大利语保留英文的词比德语多
(见第 1 节),所以 W1 会比德语批次更常见,属正常。

## 9. 交付

只改指派给你的 JSON 文件,别动仓库其它东西,**别 git commit**。
报告:每文件条数与 error/warn 数、采纳/驳回了哪些 W3 及理由、
**以及所有你判不准词性或术语无库内依据的条目(单独列一节)**。
