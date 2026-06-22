# 第一步生产插件 — 开发计划

> 前置:R1 已通过([R1-POC.md](R1-POC.md))。本计划基于**已在 VCF 9.1 真机跑通**的
> manifest / 打包 / 注册流程,做第一步的简体中文只读插件。

## 0. 目标与边界

- **目标**:一个可部署到 VCF 9.0/9.1 的简体中文 vSphere Client 插件,提供 5 个**只读**运维视图。
- **边界**:全程只读;首发 `en-US` + `zh-CN`;主战场 vCenter,Aria Ops 健康分可分期。
- **不做**:写操作、收费墙、多 vCenter(留到第二/三步)。

## 1. 沿用 R1 已验证的事实(不要再踩的坑)

| 项 | 确定值 |
|----|--------|
| 插件类型 | `vsphere-client-remote` |
| 交付形态 | vCenter 下载的 `plugin.zip`(含 manifest + UI 资源) |
| manifest | `manifestVersion`/`plugin.api.version` = `1.2.0`;必须 `requirements.vcenter.server`;`configuration.nameKey`;视图 `objects.<type>.<category>.views`;i18n = `definitions.i18n.definitions[key][locale]`;locale `en-US`/`zh-CN`;无多余字段 |
| 注册 | ExtensionManager API(`register-api.py`);改包后 bump 版本 + 清 vCenter 缓存 + 重启 vsphere-ui |
| locale 策略 | 读 `navigator.language`(R1 实测宿主经此暴露 zh-CN);严格 fallback en |

## 2. 技术栈

| 层 | 选择 | 说明 |
|----|------|------|
| 前端 | **Angular 19 + Clarity 17** | 对齐官方 sample 与 vSphere Client 原生观感;含 SDK 引导(解决 R1 中 `htmlClientSdk=false`) |
| SDK | vSphere Client remote plug-in JS SDK | 取上下文对象、locale、导航;UI 不直连产品 API |
| 后端 BFF | Java 17(Spring Boot) | 托管 plugin.zip + 聚合 API + 中文语义层;对齐注册运行时 |
| i18n | Angular i18n / 运行时字典 | 由术语词表生成 `en-US`/`zh-CN` |

## 3. 五个视图(全部只读)

| # | 视图 | 数据来源 | 备注 |
|---|------|----------|------|
| 1 | 资产总览 | vSphere Automation API | 集群/主机/VM/Datastore 计数 + 告警数 |
| 2 | 中文搜索 | vCenter inventory | 按 VM/主机/集群/告警检索 |
| 3 | 中文告警解释 | 告警名 → 语义层字典 | 英文告警 → 中文症状 + 建议 |
| 4 | 对象详情 | vCenter + Aria Ops | 状态 + 健康分 + 最近异常(Aria 可分期) |
| 5 | 上下文跳转 | SDK 上下文对象 | 从 vCenter 对象进入对应中文详情 |

## 4. 里程碑

| 阶段 | 内容 | 退出标准 |
|------|------|----------|
| **M0 脚手架** | 用 Angular+Clarity 初始化;接 SDK 引导;一个"Hello"视图按 R1 流程部署成功 | 9.1 上 `htmlClientSdk` 可用,中文标签渲染 |
| **M1 只读骨架** | 5 个视图的页面壳 + 路由 + i18n 框架 + BFF 桩 | 5 视图可打开,全中文,无 key 缺失 |
| **M2 接真数据** | BFF 接 vSphere Automation API,视图 1/2/4 出真实数据 | 资产总览/搜索/详情显示真实 vCenter 数据 |
| **M3 语义层** | 告警解释字典 + 视图 3;Aria Ops 健康分接入 | Top-N 告警有中文解释 |
| **M4 加固** | 错误处理 / fallback / 鉴权(SSO,不存凭据)/ 9.0 复测 | 9.0+9.1 双版本部署通过,验收标准全绿 |

## 5. 工程结构(目标)

```
plugin/
├── manifest/plugin.json          # 生产 manifest(沿用 R1 schema)
├── ui/                           # Angular 19 + Clarity 17
│   ├── src/app/views/            # 5 个视图组件
│   ├── src/app/i18n/             # en-US / zh-CN(由词表生成)
│   └── src/app/sdk/              # vSphere Client SDK 引导封装
├── server/                       # Java 17 Spring Boot:BFF + 语义层 + 托管 zip
│   ├── aggregation/              # vSphere Automation / Aria Ops 封装
│   └── semantics/                # 告警解释字典 + 规则
└── scripts/                      # build-zip / register-api / gen-cert(已就绪)
```

## 6. 验收标准(对齐 HLD §8.3)

- [ ] 插件在 9.0 GA、9.1 GA 均 DEPLOYED 并渲染
- [ ] 默认中文环境 5 视图全中文,无 key 缺失 / 不崩溃
- [ ] 切 en 环境正确 fallback
- [ ] 告警解释覆盖 Top-N 常见告警
- [ ] 全程只读,无任何写 API 调用
- [ ] 不自存 vCenter 凭据(复用 SSO/会话)

## 7. 依赖与风险

| 项 | 状态 |
|----|------|
| 术语词表 | 用户提供中(语义层与 i18n 的输入) |
| vSphere Automation / Aria Ops API 鉴权 | M2/M3 打通;Aria 可分期 |
| 9.0 GA 环境 | 需补一次复测(R1 同流程) |
| SDK 引导脚本 | M0 解决 htmlClientSdk |

## 8. 立即可做的第一件事

**M0**:用官方 remote plug-in sample(Angular+Clarity)起脚手架,把一个最小视图按 R1 的
`build-zip → register-api → 部署` 流程跑通,确认 SDK 引导后 `htmlClientSdk` 可用。
其余视图在此骨架上迭代。
