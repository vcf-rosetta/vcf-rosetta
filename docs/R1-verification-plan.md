# R1 验证方案 — 宿主能否渲染插件自带 zh-CN

> HLD 风险 R1(最高优先级)· 这是整个第一步的地基

## 目的

VCF 9.0 已从宿主移除 `zh-CN`。需在真机回答两个问题:

1. **宿主 chrome**:`plugin.json` 里 zh-CN 的插件名/菜单名,vSphere Client 会不会渲染成中文?
2. **插件 iframe**:vSphere Client 会不会把 `zh` locale 传给插件?插件 iframe 内的中文是否始终能显示?

## 判定矩阵

| 观察 | 结论 | 行动 |
|------|------|------|
| iframe 内中文正常 + 宿主传 zh | **R1 完全通过** | 可按宿主 locale 自动切中文 |
| iframe 内中文正常 + 宿主不传 zh | **R1 部分通过(预期)** | 插件自管 locale(HLD §6.3),不依赖宿主;chrome 名可能仍是英文 |
| iframe 内中文乱码/不显示 | **R1 失败** | 走兜底:字体/编码排查,或 DOM 直填中文 |
| 插件根本不出现 | 注册问题(非 R1) | 查 thumbprint 匹配(最常见) |

## 步骤

```bash
cd plugin

# 1. 生成证书(SAN 必须是插件服务器 FQDN)
bash scripts/gen-cert.sh plugin-host.example.com

# 2. 启服务(HTTPS)
node server/serve.mjs --cert ./certs/server.crt --key ./certs/server.key --port 8443

# 3. 取实际 thumbprint(确认与注册值一致)
bash scripts/get-thumbprint.sh plugin-host.example.com 8443

# 4. 注册到 vCenter(需 Java 17 + SDK 注册工具 + 管理员)
export VC_HOST=vcenter.example.com VC_USER=administrator@vsphere.local
export PLUGIN_URL=https://plugin-host.example.com:8443/plugin.json
export THUMBPRINT=<step-3 输出>
export SDK_TOOL=/path/to/vsphere-client-sdk/registration-tool.jar
bash scripts/register.sh

# 5. 退出并重新登录 vSphere Client → 打开插件 → 读探针结论
```

## 验收

- [ ] 插件出现在 vSphere Client 导航
- [ ] iframe 内"集群·数据存储·告警·症状·建议操作"显示为中文
- [ ] 探针表列出宿主 locale 信号,verdict 给出明确结论
- [ ] 记录:宿主是否传 zh、chrome 插件名语言
- [ ] 在 **9.0 与 9.1 各跑一遍**

## 输出
把结论回填到 [HLD.md](HLD.md) §10 R1,决定第一步是否需要兜底方案。

> 注:`plugin.json` 的精确 schema 与注册工具 flag 需对照官方 SDK sample 最终校准(已在文件注释标注 SCHEMA NOTE)。
