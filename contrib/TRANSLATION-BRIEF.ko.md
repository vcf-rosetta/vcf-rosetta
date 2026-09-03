# 英译韩翻译简报 — VCF / vSphere 界面串

批次机翻的**唯一权威口径**。方法论与 `TRANSLATION-BRIEF.de.md` / `.it.md` 相同,
但**术语表和句法规则都完全不同,绝不能照搬**。

> ## 三种语言,三套规则 —— 照搬会系统性翻车
>
> | 英文 | 德语 | 意大利语 | 韩语 |
> |---|---|---|---|
> | Datastore | Datenspeicher(翻) | Datastore(保留) | **데이터스토어**(音译) |
> | Image | Image(保留) | Immagine(翻) | **이미지**(音译) |
> | Timeout | Zeitüberschreitung(翻) | Timeout(保留) | **시간 초과**(翻) |
> | Stretched Cluster | 保留英文 | cluster esteso(翻) | **확장된 클러스터**(翻) |
> | Witness | Zeugenhost(翻) | Witness(保留) | **감시**(翻) |
> | Remediation | Standardisierung | Correzione | **업데이트 적용** |
>
> 最后一行最能说明问题:同一个 `Remediation`,德语「标准化」、意语「纠正」、
> 韩语「应用更新」—— 韩语走的是 vLCM 的实际语义,另两语走的是字面。
> **每个术语都必须查 `plugin/i18n/glossary.ko.json` 重新定。**

## 0. 工作方式

在批次文件里**原地填值**:键完全不变,只把空字符串填成韩语。
旁边的 `.ref.json` 是中文参考。

> **中文参考只能用于理解语义,绝不能用来判断词性。**
> 实测(德语侧):6/6 翻错的短标签,中文犯同样的错或有同样歧义 —— 中文词条本身是同一
> 无上下文流程产出的,错误相关而非独立。

## 1. 产品/组件名保持英文

NSX · vSphere · vSAN · vCenter · ESXi · ESX · VCF · vMotion · vLCM · Supervisor · Orchestrator ·
Fault Tolerance · Chargeback · Super Metric · Global Manager · Load Balancer · DataSets · VMware ·
Aria · SDDC · Tier-0 · Tier-1 · vApp · VMware Tools · Single Sign-On · Active Directory ·
Storage DRS · Network I/O Control · Storage I/O Control · Workspace ONE ·
**Distributed Switch**(库内 285:19 保留英文,与德意两语一致)

CPU 指令集名、硬件型号、事件 ID、日志级别常量、HTTP 方法、camelCase 配置键一律原样保留。
韩语侧保留英文的比例比德语高:产品名后直接接韩语助词即可(`vCenter Server에`、`NSX를`)。

## 2. 占位符原样保留

`{name}` `[data.x]` `%(0)s` `%s` `{0}` —— 审核项 E3 会拦。
**注意:占位符后面接助词时,韩语的助词形态取决于占位符实际展开的值**,官方包的做法是
用中性写法回避(如 `{name}에 대해` 而非 `{name}을/를`)。跟随库内既有写法。

## 3. 已裁定术语(从 glossary.ko 数出来的,直接用)

```
Datastore   -> 데이터스토어 (1007:8)      Datacenter -> 데이터 센터 (175)
Image       -> 이미지 (494:14)            Compliance -> 규정 준수 (215)
Health      -> 상태 (787)                 Disk -> 디스크 (2608)
Cluster     -> 클러스터 (2831)            Host -> 호스트 (5880)
Snapshot    -> 스냅샷 (362)               Template -> 템플릿 (139)
Wizard      -> 마법사 (29)                Privileges -> 권한 (131)
Permissions -> 권한 / 사용 권한 (72/58)   Maintenance Mode -> 유지 보수 모드 (384)
Workload    -> 워크로드 (90)              Overview -> 개요 (22)
Alert       -> 경고 (64)                  Alarm -> 경보 (667)   ← 这两个不是一回事
Timeout     -> 시간 초과 (99)             Upgrade -> 업그레이드 (732)
Baseline    -> 기준선 (145)               Uplink -> 업링크 (146)
Namespace   -> 네임스페이스 (85)          Policy -> 정책 (661)
Stretched Cluster -> 확장된 클러스터 (136)  Witness -> 감시 (335:8)
Remediation / Remediate -> 업데이트 적용   ← 不是字面的「修正」,是 vLCM 的实际语义
```

不在表里的术语**必须先查库再定,不许凭感觉**,而且**要看频次,不能只看单条** ——
德语侧实测三次被单条查询误导(`Image→Abbild` 实际 484:2 反向等)。

```bash
node -e 'const ko=require("/Users/zw/testany/myskills/vcf-rosetta/plugin/i18n/glossary.ko.json");
const h=Object.entries(ko).filter(([k])=>/YOUR_TERM/i.test(k));
console.log("n="+h.length); h.slice(0,10).forEach(([k,v])=>console.log(k.slice(0,60)," -> ",v.slice(0,70)))'
```

## 3.5 方向词用同一套(2026-09-04 修正)

```
In / IN     -> 수신          Out / OUT -> 송신
In-Out      -> 양방향        Direction -> 방향
```
原来 `In` 写成音译 `인바운드` 而 `Out` 是 `송신`,同一组词混了两套register。

> 顺带一个**验证后没改**的例子:官方库有 `in -> 다음에서`(小写,介词义),
> 看着像 `In` 该译成包含关系。但同批存在 `Out`/`OUT`/`In-Out`/`Direction`,
> 证明这里的 `In` 是**流量方向**,不是过滤运算符。
> 近重复比对会把大小写不同的键配成一对,**配对结果必须回到上下文里验证再改**。

## 4. 韩语句法惯例 —— 与德意两语是三套不同的东西

**短动作标签用【名词形】**(库内 848/1049),不用句子体:

```
Add a host to a cluster -> 클러스터에 호스트 추가       ← 目的语 + 动作名词
Add Capacity Disks      -> 용량 디스크 추가
Add a vCenter server    -> vCenter Server 추가
```
-하십시오 在短标签里只有 10 次,-합니다 51 次 —— **短标签不要用句子体**。

**长句按功能分体**(库内长句抽样:-합니다 65 / -하십시오 43):
- 描述、状态说明 → `-합니다`(陈述体)
- 对用户的指示、操作步骤 → `-하십시오`(敬语祈使)

**助词(조사)随前词收音变化** —— 这是韩语特有、德意两语没有的维度:
```
받침 있음(有终声) : 을 / 이 / 은 / 과 / 으로
받침 없음(无终声) : 를 / 가 / 는 / 와 / 로
```
> ⚠️ **跨批次统一术语时绝不能用字符串替换** —— 换掉一个名词,后面的助词可能整个错掉。
> 德语侧实测踩过类似的坑(阴性名词换成阳性,属格冠词没跟着改),韩语更严重。
> 必须逐条看语法环境。

## 5. 短标签(<=20 字符)的歧义 —— 错误率最高的一类

德语侧实测短串错误率 **25%**,长句 8%。根因是英文短标签没上下文。
韩语的表现与德语不同:名词形本身可以同时承载动作和事物两种读法
(`업데이트 설정` 既可读作「更新设置」也可读作「更新的设置」),**歧义没有消失,只是被掩盖了**。

**怎么判**:① 查库找同族先例(最可靠);② 看同批次相邻键(按字母序排,常同属一个界面区域);
③ **实在判不出就在报告里列出来,不要硬猜** —— 那份清单是人工复核的入口。

## 6. 完成标准

每个文件跑到 **0 error**:

```bash
node contrib/check-batch.mjs contrib/incoming/ko/batches/<file>.json ko
```

checker 已支持韩语词元规则:按谚文块取词,并剥掉常见助词/词尾(`으로/에서/입니다/합니다/하기/의/을/를/이/가/은/는…`),
否则同一术语的不同助词形会被当成不同词。

W3(术语偏离)从 glossary 现算主流译法,**有已知误报,不要盲从**。
德语侧归纳的四类误报机制与语言无关,韩语同样适用:

| 模式 | 说明 |
|---|---|
| ① 术语只作为更大专名的一部分出现 | 证据全来自某个产品名 |
| ② 同形异义 | 如 `Transit` 的证据全是 *data-in-transit*,与 NSX Transit Gateway 无关 |
| ③ 形态变化 | 韩语的助词/词尾变化会让比对失效(已在分词时部分处理,仍有残留) |
| ④ 动词形误报 | 库内 API 描述的 `-합니다` 形被当成术语 |

W1(译文与英文相同)只在确实是专名/字面量时可接受。

## 7. 交付

只改指派给你的 JSON 文件,别动仓库其它东西,**别 git commit**。
报告:每文件条数与 error/warn 数、采纳/驳回了哪些 W3 及理由、
**以及所有你判不准词性或术语无库内依据的条目(单独列一节)**。
