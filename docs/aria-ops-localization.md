# Aria Operations(VCF Operations)汉化方案

## 结论:走浏览器扩展,不走插件
Aria Operations(原 vRealize Operations / 现 VCF Operations)是**独立产品**,有自己的 Web UI、自己的主机和插件 SDK,**不能**用 vCenter 的 remote plug-in 那套(`plugin/`)。但它的界面同样是 Clarity/Angular SPA,所以**同一个浏览器扩展的 DOM 文本替换引擎可以直接复用**。需要补的只有两件事:页面识别 + 专属词库。

## 已做
- 扩展页面识别(`content/translator.js` 的 `shouldActivate`)已加入 Aria 特征:
  标题含 `Aria Operations` / `VCF Operations` / `vRealize Operations` 即激活。
- 采集/回流(收集未翻译词条 → Issue/邮件)在 Aria 页面同样可用 —— 这正是冷启动 Aria 词库的手段。

## 待做(按工作量排序)
1. **专属词库**:Aria 的术语与 vCenter 差异较大(指标、告警定义、仪表盘、超额配置、容量回收…)。两种来源:
   - **官方语言包**:若 Broadcom 为 Aria Operations 发布了 zh-CN/其他语言资源,用与 vCenter 相同的 `build-locale.mjs` 思路从官方包抽 en↔loc 配对作为种子。
   - **众包**:官方覆盖不足的部分,靠运维在 Aria 页面用扩展"收集未翻译词条"回流(`contrib/` 流程),维护者合并。
2. **词库命名分面**:建议 Aria 词条单独成域,便于按需下载、避免与 vCenter 词库互相污染:
   - 方案 A(简单):并入同一 `dict.<lang>.json`,Aria 术语作为新增条目。冷启动快,但包体一起变大。
   - 方案 B(推荐,规模化后):按产品面分包 `dict.aria.<lang>.json`,`langs.json` 增加 `surface` 维度,扩展按"当前是哪类页面"只下对应包。
3. **页面识别精化**:Aria 部署主机名/路径与 vCenter 不同,必要时在 `langs.json`/检测逻辑里补 host 特征,降低误判。

## 落地顺序建议
先用**现有扩展 + 众包采集**在真实 Aria 环境跑一轮,拿到高频缺词清单 → 评估官方包是否够用 → 再决定 A/B 分包。即:**先采集、后建库**,与 vCenter 当初的做法一致。
