# contrib — 社区词条贡献

让各地区运维一键回传"没翻到的界面词条",维护者只需 `git pull` + 合并。

## 贡献者(零门槛)
1. 安装 Rosetta 扩展,打开弹窗,勾选 **收集未翻译词条**。
2. 正常浏览 vCenter(任务、告警、权限等缺词页面)。
3. 点 **一键贡献到 GitHub** → 浏览器打开预填好的 Issue → 点 **Submit**。
   - 内容只有界面英文词条(JSON 数组),不含任何业务数据。
   - 词条很多时,Issue 会自动只带前一批;其余用 **导出 JSON(本地)** 后拖进评论即可。

## 维护者(我只管拉)
1. 收到带 `translation-contribution` 标签的 Issue,把里面的 JSON 数组存成文件,例如 `/tmp/terms.json`。
2. 去重整理成待译骨架:
   ```bash
   node contrib/merge-incoming.mjs /tmp/terms.json zh-CN
   # → contrib/incoming/zh-CN/candidates-<n>.json   (已剔除“已翻译”和“运行时数据”)
   ```
3. 补全译文(把空字符串填上),然后并入领域词典并重建:
   ```bash
   # 移到 plugin/i18n/domains/ 下(命名如 contrib-zh-CN-2026-06.json),并入 glossary 后:
   node browser-extension/build-dict.mjs
   ```
4. 发布:`bash plugin/rosetta.sh update`(或商店上传新版本)。

## 目录
| 路径 | 用途 |
|------|------|
| `contrib/incoming/<lang>/` | 去重后的待译候选(骨架,值为空) |
| `plugin/i18n/domains/` | 已译领域词典(构建词库的源) |
| `.github/ISSUE_TEMPLATE/i18n-contribution.yml` | 贡献 Issue 模板 |

> 语言种子:官方语言包覆盖 fr/es/ja/de(+ 本项目 zh-CN);其余小语种主要靠社区在此回流。
