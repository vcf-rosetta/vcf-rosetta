# plugin/i18n — VCF / vCenter 术语词库(英→多语言)

> ⚠️ 路径里虽带 `plugin/`,但本目录**不属于**那个⏸️暂缓的远程插件,而是**全项目活跃的核心资产**:
> 浏览器扩展的所有 `dict.<locale>.json` 都从这里构建。它是英文 UI 串 → 各语言的**权威词库**。

## 语言范围(标准)

VCF 9 原生只支持 4 种界面语言(English / 日本語 / Español / Français),用户在 VCF 9 里直接切即可,
**本项目不为这 4 种做词库**。只补 VCF 9 **已放弃**的语言:

| 文件 | 语言 | 条数 | 来源 |
|------|------|------|------|
| `glossary.zh-CN.json` | 简体中文 | **49,950** | 官方 + 审定 + 域补词(**唯一审定/curated 的语言**) |
| `glossary.zh-TW.json` | 繁體中文 | ~35k | 官方 |
| `glossary.de.json` | 德文 | ~37k | 官方 |
| `glossary.it.json` | 意大利文 | ~37k | 官方 |
| `glossary.ko.json` | 韩文 | ~37k | 官方 |

> 官方语言包里 ja/es/fr 也有专业翻译,但因 VCF 9 原生支持,**故意不纳入**。详见 `build-all-locales.mjs` 头注。

## 文件

| 文件 / 目录 | 内容 |
|------|------|
| `glossary.<tag>.json` | 各语言**权威词表**(英→该语言),按英文键排序。`build-dict.mjs` 直接消费 |
| `glossary.overrides.zh-CN.json` | zh-CN **审定覆盖表**:跨领域冲突裁决 + 核心补充(如 `Build`→构建),已合入主词表 |
| `glossary.conflicts.json` | 冲突原始记录(同英文多译法),审定前快照,留档 |
| `domains/<domain>.json` | 84 个**按领域**拆分的补词(NSX / vSAN / 存储 / 权限 / Aria Ops / H5 对话框…),增量并入主词表 |

## 脚本

| 脚本 | 用途 |
|------|------|
| `build-locale.mjs <LOC> <pack>` | 从官方语言包提取**单个**语言 → `glossary.<tag>.json`(en↔LOC 按 key join) |
| `build-all-locales.mjs <pack>` | **批量**提取,但只建 VCF9 已放弃的语言;已存在的文件视为权威,**不覆盖**,只补缺失 |
| `enrich-from-pack.mjs <pack>` | **增量丰富**已有 glossary:只加包内新发现的 en→loc 词条,**绝不覆盖**已有/审定译法 |

> `<pack>` = 解压后的官方语言包目录。语言包 `.tgz` **不入库**(放仓库外的 `tmp/`),按需传路径即可。
> 改词库后,跑 `node browser-extension/build-dict.mjs` 重建 `dict.*.json`。

## 审定原则(摘要,zh-CN)

- **移除/删除** = Remove/Delete 区分;**故障转移** = Failover
- **映像**=Image;**基准**=Baseline;**标记**=Tag;**份额**=Shares;**构建**=Build(菜单/动作)
- **入站/出站**=Ingress/Egress;**软件库**=Depot;**账户**=Account(非"帐户");**来宾**=Guest(非"客户机")
- 纯缩写(BGP/MTU/APD/LUN)保留;生僻缩写(SCIM/TEP/NSSA)带简注;产品名保留原文
- 标签型 `xxx:` 用半角冒号

## 说明

- **"英文==中文"不是漏译**:专有名词(vSphere Client、vMotion、CPU、UUID…)按惯例保留英文,属正常。
- **覆盖缺口**:官方语言包是 vCenter 自身 UI 术语;**H5 客户端对话框长描述、VCF 9 / Aria Ops 新界面**官方包未必有,
  这部分靠扩展的**采集回流**(见 `../../contrib/`)+ 人工补译,放进 `domains/` 增量并入。
