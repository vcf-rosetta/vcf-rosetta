# browser-extension — vCenter 中文界面

把 **整个 vCenter Server / VCF 9.x UI 实时翻译为简体中文** 的浏览器扩展(Chrome/Edge MV3),
完全在浏览器侧工作,**不修改 vCenter 服务器**。翻译引擎由 [`plugin/i18n/`](../plugin/i18n/) 的
**12,818 条审定术语词表**驱动。

> 为什么用浏览器扩展而非 vSphere 远程插件:远程插件跑在沙箱 iframe 里,只能翻自己的视图,
> **碰不到 vCenter 宿主 UI**;浏览器扩展有整页访问权,**能翻译整个原生界面**——这才是"让 VCF 变中文"的载体。
> 远程插件(见 `plugin/`)是另一条线,用于自有中文视图与未来付费功能。

## 结构

```
browser-extension/
├── manifest.json          MV3 清单
├── dict.js                window.__vcDict = {12,818 条}(自动生成,勿手改)
├── build-dict.mjs         从 plugin/i18n/glossary.zh-CN.json 重新生成 dict.js
├── content/translator.js  翻译引擎:MutationObserver + TreeWalker
└── popup/                 启用开关 + 主机白名单设置
```

## 安装(开发者模式)

1. Chrome/Edge 打开 `chrome://extensions`,开启「开发者模式」
2. 「加载已解压的扩展程序」→ 选择本 `browser-extension/` 目录
3. 打开 vCenter(`https://<vc>/ui`)→ 界面自动变中文

## 配置

点扩展图标:
- **启用翻译**:总开关
- **主机白名单**:留空则自动识别 vCenter 页面(`/ui` 路径 / 标题含 vSphere、vCenter、SDDC Manager / Clarity 特征);填了则只在这些主机生效
- 保存后**刷新页面**生效

## 更新词表

词表改了之后重新生成 `dict.js`:
```bash
node browser-extension/build-dict.mjs
```

## 工作原理

- `dict.js` 把英→中词表注入 `window.__vcDict`
- `translator.js` 首次全量扫描 DOM 文本节点 + 属性(placeholder/title/aria-label),命中词表即替换;
  再用 `MutationObserver` 跟踪 Angular SPA 的路由切换与异步加载,持续翻译
- 跳过 `script/style/code/pre/textarea`,保留文本首尾空白

## 已知边界

- 只翻译**词表里有的**字符串;实际界面里的新词需补进词表(见 `plugin/i18n`)
- 动态拼接 / 变量插值的文本可能漏翻
- 不翻译 canvas / 图片内文字
