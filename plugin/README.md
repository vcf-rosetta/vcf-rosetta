# plugin — vcf-rosetta vSphere Client remote plug-in

VCF 9.0 / 9.1 的 vSphere Client **remote plug-in** 源码。为运维人员提供本地化(首发简体中文)
界面与中文运维语义层。

## 计划目录结构(脚手架待补)

```
plugin/
├── manifest/          # plugin-package.xml / 版本与 9.0+9.1 兼容声明
├── src/               # 插件前端(Angular 19 + Clarity 17,对齐官方 sample)与视图
│   └── i18n/
│       ├── en-US.json # 英文资源(fallback 基准)
│       └── zh-CN.json # 简体中文资源
└── server/            # 可选:remote plug-in 后端服务入口
```

## i18n 约定

- key 在 `en-US.json` 与 `zh-CN.json` 中一一对应
- 缺 key 时严格 fallback 到 `en-US`,不得渲染崩溃
- 术语统一见 [../docs/architecture.md](../docs/architecture.md) 第 5 节

## 状态

🚧 脚手架待生成 —— 当前仅占位。下一步:用 vSphere Client SDK remote plug-in sample 初始化。
