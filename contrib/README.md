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
4. 发布:`bash browser-extension/scripts/publish-langpacks.sh`(推词典到 CDN,联网包用户自动更新);
   或重打离线包 `node browser-extension/scripts/pack-store.mjs --offline`;商店则上传新版本。

## 目录
| 路径 | 用途 |
|------|------|
| `contrib/incoming/<lang>/` | 去重后的待译候选(骨架,值为空) |
| `plugin/i18n/domains/` | 已译领域词典(构建词库的源) |
| `.github/ISSUE_TEMPLATE/i18n-contribution.yml` | 贡献 Issue 模板 |

> 语言范围:本项目只做 VCF 9 **已放弃**的 5 种(zh-CN/zh-TW/de/it/ko);VCF 9 原生支持的 en/ja/es/fr 不做。
> 官方语言包覆盖经典 vCenter UI,**回流主要补**官方包没有的新界面(H5 对话框、Aria Ops 仪表板)的缺词。

## 审定红线(翻译/审校必须遵守)

机器翻译会不自觉地往"官方 vCenter 用语"靠,但本项目审定特意做了取舍。批量翻译/审校时强制:
- **账户**(Account),不是"帐户"
- **来宾**(Guest),如"来宾操作系统",不是"客户机操作系统"
- **主管**(Supervisor),统一中译,不保留英文 Supervisor
- **映像**=Image(VM/ISO/模板);**镜像**=Mirroring(数据/磁盘镜像)——勿混
- 标签型 `xxx:` 用半角冒号,与全表一致(不要改全角 `：`)
完整原则见 `plugin/i18n/README.md` 的「审定原则」。
