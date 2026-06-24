# Chrome 应用商店 — 商品信息文案(中/英)

> 复制到 Chrome 开发者后台「商品详情」。短描述 ≤132 字符。

## 名称(Name — 由 _locales 本地化)
- 简体中文(zh_CN):**vCenter 翻译助手 (Rosetta)**
- English(en):**Rosetta — vCenter / VCF UI Translator**

> 名称/描述通过 `_locales/<locale>/messages.json` 提供,Chrome 按用户界面语言自动显示对应版本。

## 简短描述(Summary, ≤132 chars)
将 VMware vCenter / VCF 9.x 控制台 UI 实时翻译为简体中文或德文,无需改动 vCenter 服务器。

EN: Real-time Simplified-Chinese / German UI translation for VMware vCenter / VCF 9.x — no server-side changes.

## 类别(Category)
Workflow & Planning(或 Developer Tools)

## 语言(Language)
简体中文(default),English

## 详细描述(Description)
vcf-rosetta 在浏览器端把 VMware vCenter Server / VCF 9.x 的 Web 控制台界面文本实时替换为简体中文(或德文),帮助中文运维人员降低读图门槛。

• 纯前端 DOM 文本替换,不修改、不代理 vCenter 服务器,不触碰任何业务数据或配置。
• 词典基于 VMware 官方多语言包 + 人工审定术语(4.6 万+ 条),用词统一。
• 只在被识别为 vCenter / VCF 控制台的页面上生效;可在弹窗中按主机白名单精确控制启用范围。
• 词典随扩展本地打包,翻译全程在本地完成,不向任何服务器发送页面内容。
• 支持一键切换语言(中/德),以及导出未翻译词条以便持续补全。

适用对象:管理 VMware Cloud Foundation 9.x / vSphere 的中文运维与实施团队。

注:本扩展为社区本地化工具,与 Broadcom / VMware 无隶属关系,不分发任何 VMware 软件。

## 单一用途说明(Single purpose — 必填)
本扩展的唯一用途:将 VMware vCenter / VCF Web 控制台的界面文本本地化(翻译)为用户选择的语言。

## 权限说明(Permission justifications — 必填)
- **storage**:保存用户设置(启用开关、语言、生效主机白名单、是否采集未翻译词条)。仅本地/账号同步,不外发。
- **scripting / activeTab**:在当前 vCenter 标签页应用翻译、切换语言时刷新生效。
- **host access(`https://*/*`)**:vCenter/VCF 部署在客户自有、任意主机名的内网地址上,扩展无法预先穷举,因此需要在用户访问的 HTTPS 页面上判断是否为 vCenter 控制台并替换文本。**内容脚本会先做 vCenter 页面特征判断,非 vCenter 页面不加载词典、不做任何处理。** 用户还可用弹窗的主机白名单进一步收窄。

## 数据使用声明(Privacy practices — 必填项,据实勾选)
- 是否收集用户数据:**否**。
- 不收集、不传输 PII、不做远程分析。所有处理在本地完成。
- 隐私政策 URL:见 store/PRIVACY.md(发布前需托管为公开 URL,例如 GitHub Pages)。
