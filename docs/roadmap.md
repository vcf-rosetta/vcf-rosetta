# vcf-rosetta — 路线图与待办

> 2026-07-02 全面改写:**主线 = 浏览器扩展**(已上架 Chrome 应用商店,持续迭代)。
> 旧版路线图围绕 vSphere remote plug-in 展开,该方向已**暂缓**且不在本路线图内
> (代码保留于 `plugin/`,其中 `plugin/i18n/` 词库是扩展的活跃数据源,不随插件暂缓)。

## 已交付(现状)

- **首发 v3.4.33,现 v3.4.38**:vCenter / VCF / Aria Operations 原生 UI 实时翻译(Chrome/Edge MV3)
- 5 种翻译语言(zh-CN / zh-TW / de / it / ko,VCF 9 已放弃的语言),词库 5 万+ 条/语言
- 6 语言弹窗界面;轻量包(CDN 取词典)/ 离线包(词典内置,隔离网可用)双形态
- **已上架 [Chrome 应用商店](https://chromewebstore.google.com/detail/vcf-9-ui-translator/fcpofclniofejlnhfckblonhecghkbmp)**;离线包经 GitHub Releases 固定直链分发
- 词典分发管线:URL 钉发布 tag + `@main` 目录发现新版本 → 已装用户自动更新词库
- 多 CDN 回退(jsDelivr 主域 + fastly/gcore 镜像)、下载失败弹窗明确告警
- 归一化二级查找(大小写 / 尾部 `:`/`…` 漂移自动命中)—— 缓解跨 VCF 版本措辞差异
- 缺词采集 → 导出 / 一键 GitHub Issue → `contrib/` 合并回流的众包闭环

## 进行中

| 项 | 状态 |
|----|------|
| 商店版持续迭代 | ✅ 已上架并迭代至 v3.4.38(提审上传 `dist/vcf-rosetta-<版本>.zip`) |
| VCF 9.0.2 / SDDC Manager 词表回流 | ⬜ 等现场用户导出缺词 JSON(SDDC Manager 词条目前任何来源都没有) |

## 待开发(backlog,按优先级)

### 代码 — 翻译引擎
- [ ] 同源 iframe 内部导航后重新挂观察器(嵌入式控制台失翻;review M5)
- [ ] 词典下载/持有移入 service worker,各 frame 共享一份(内存 ×N → ×1;review M6)
- [ ] 激活检测失败后延迟重试 2-3 次(慢渲染 SPA / iframe 竞态)
- [ ] `translateAttrs` 走 PHRASES 模式 + 记录缺词(tooltip/placeholder 覆盖;review L5)
- [ ] SPA 标题变更后重译 `<title>`(review L6)
- [ ] `web_accessible_resources` 加 `use_dynamic_url`,防任意网站探测扩展指纹(review L2)
- [ ] 观察器批量去重降为 O(n·depth)(祖先链 + Set;review L1)
- [ ] popup「添加当前站点」按协议而非 hostname 判断浏览器内部页(review L3)

### 代码 — 构建与数据
- [ ] `build-dict.mjs` 过滤:丢非字符串值 / `_note` / key===value 死条目,缩包体(review L7)
- [ ] (评估)商店版内置 zh-CN 词典(+~1.4MB),中文主力用户零依赖 CDN

### 运营与生态
- [ ] 商店 listing 描述修正:`48k+ terms` → 按语言 39k–52k 的真实口径;Homepage/Support URL 从 langpacks 旧仓库换成主仓库(同步 `store/LISTING.md`)
- [ ] 归档旧 `vcf-rosetta/langpacks` 仓库,README 指向主仓库
- [ ] Edge Add-ons 上架(同一 zip 提审,vSphere 运维大量用 Edge)
- [ ] Aria Operations(VCF Operations)界面词条专项采集(仪表板/告警页覆盖仍薄)

## 词库运营(常态化)

```
用户开「收集未翻译词条」→ 导出 JSON / 一键 Issue
  → contrib/merge-incoming.mjs 去重合并 → 人工翻译入 plugin/i18n/domains/
  → build-dict.mjs 重建 → publish-langpacks.sh(强制 bump 版本)→ 已装用户自动收到
```

## 文档索引

- [architecture.md](architecture.md) — 架构
- [glossary.md](glossary.md) — 术语词表
- 安装/使用指南 — [index.html](index.html)(GitHub Pages 首页,6 语言)
