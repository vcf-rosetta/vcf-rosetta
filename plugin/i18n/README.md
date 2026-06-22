# plugin/i18n — vCenter / VCF 9 术语词表(英→中)

本目录是 vcf-rosetta 的**简体中文术语资产**,从前期 Chrome 翻译扩展的领域词典收编、合并、
去重而来(原扩展目录已弃用)。它既是插件 i18n 的**术语来源**,也是保证全产品中文用词一致的
**规范词表**。

## 文件

| 文件 | 内容 |
|------|------|
| `glossary.zh-CN.json` | **主词表**,12,813 条唯一英→中映射,按英文键排序。合并 73 个领域词典(冲突按加载顺序 last-wins) |
| `glossary.supplement.zh-CN.json` | **项目补充/校准**,补齐主词表缺失的核心运维术语 + 统一冲突项规范译法。**优先级高于主词表** |
| `glossary.conflicts.json` | 跨领域**冲突清单**(同一英文有多个译法),628 条,待人工定稿 |
| `domains/<domain>.json` | 73 个**按领域**拆分的词典(NSX / vSAN / DRS / 存储 / 权限 / 自动化…),保留原始分类 |

## 合并优先级

```
glossary.zh-CN.json  →  glossary.supplement.zh-CN.json(后者覆盖)
```

## 说明

- **"英文==中文"不是漏译**:大量专有名词(vSphere Client、vMotion、CPU、UUID、VMXNET3…)
  按惯例保留英文,属正常。
- 词表是 **vCenter 自身 UI 术语**的英→中映射,作用有二:
  1. 作为本项目插件自身 i18n 的**用词规范**(避免"映像/镜像"这类不一致)
  2. 未来若做 DOM 级翻译,可直接作为数据源
- 与插件 manifest 的 i18n(`definitions.i18n.definitions[key][locale]`)不同:那是**消息键→各语言**,
  本词表是**英文 UI 串→中文**。生产插件取词时,以本词表的规范译法填 manifest 的 zh-CN 值。

## 待办(术语定稿)

- [ ] 人工审 `glossary.conflicts.json` 628 条,定稿后并入 supplement
- [ ] 随产品迭代补充新词条
