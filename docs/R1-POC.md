# R1 POC — 验证 VCF 9 能否通过插件加回中文

> 给执行测试的同事:这份文档讲清**为什么测、怎么判定成功、怎么跑、把结果填哪**。
> 配套脚本在 `plugin/`,详细步骤在 [R1-verification-plan.md](R1-verification-plan.md)。

---

## 1. 测试目的(一句话)

VCF / vCenter 9.0 已把简体中文从宿主删除。本 POC 用一个最小插件验证:
**我们插件自带的中文资源,vSphere Client 9.0/9.1 到底认不认、显不显示?**

这是整个项目的商业前提。成立 → 放心做第一步;不成立 → 早改方案。

---

## 2. 成功判定标准

测试会回答三个问题,据此判定:

| # | 观察点 | PASS | 说明 |
|---|--------|------|------|
| Q1 | 插件 iframe 内 "集群·数据存储·告警·症状·建议操作" | **显示为正常中文** | 不乱码、不缺字 → 中文界面技术可行 |
| Q2 | 探针表 verdict 行 | 任一结论都算 PASS | 见下方两种情形 |
| Q3 | 左侧导航里的插件名 | 记录是中文还是英文 | 决定中文能否覆盖到宿主 chrome |

**整体结论分级:**

- ✅ **完全成立**:Q1 中文正常 **且** 宿主把 `zh` 传给插件(verdict 显示 ✅)
  → 可跟随宿主 locale 自动切中文,实现最简单。
- ✅ **成立(需自管 locale,预期情形)**:Q1 中文正常,但宿主**不**传 `zh`(verdict 显示 ⚠️)
  → 项目依然成立,按 HLD §6.3 由插件自己判定语言。**这是最可能的结果。**
- ❌ **不成立**:Q1 中文乱码/不显示,或插件根本不出现
  → 走兜底排查(字体/编码/CSP),或重新评估方案。

> 关键认知:**verdict 显示 ⚠️ 不是失败**。它只说明"不能靠宿主自动切",而我们本来就设计了插件自管 locale。真正的失败是 Q1 中文出不来。

---

## 3. 怎么跑(远程环境)

需要:一套 **vCenter 9.0/9.1** + **Java 17** + **vSphere Client SDK 9.0**(含注册工具)+ 一台 vCenter 能访问的主机跑插件服务。

```bash
git clone https://github.com/vcf-rosetta/vcf-rosetta.git
cd vcf-rosetta/plugin
cp r1.env.example r1.env        # 填 PLUGIN_HOST / VC_HOST / VC_USER / SDK_DIR
bash prepare.sh                 # 查依赖、生成证书、算指纹、找 SDK 工具、打印命令
# 然后按 prepare.sh 打印的两条命令:启动服务 + 注册
# 重登 vSphere Client → 打开 "VCF Rosetta(R1 验证)" → 读探针
```

**在 9.0 和 9.1 各跑一遍**(结果可能不同)。常见坑见 [R1-verification-plan.md](R1-verification-plan.md)。

---

## 4. 参照:本机基线输出(无 vSphere 宿主)

下面是用无头浏览器在**本地直接打开插件页(没有 vCenter)**时探针的真实输出,
供对比——它代表"宿主完全不参与"时的样子:

```
中文渲染自检 (iframe content — should always be Chinese)
  集群 · 数据存储 · 告警 · 症状 · 建议操作          ← 中文正常(Q1 在无宿主时已 PASS)

宿主报告的 locale:
  url.locale                      (none)
  url.lang                        (none)
  url.search (raw)                (empty)
  window.htmlClientSdk present    false            ← 本地无 SDK 注入(真机里应为 true)
  window.vSphereClientSdk present false
  navigator.language              en-US
  navigator.languages             en-US, en
  document.documentElement.lang   zh-CN

⚠️ 宿主未传递 zh locale(预期)。→ 插件须按 HLD §6.3 自行判定语言,不能依赖宿主。
```

**真机里的关键差异:** 在真正的 vSphere Client 内,`window.htmlClientSdk present` 应变为
`true`,且 `url.*` / `sdk.*` 可能带 locale。请重点看那几行真机里变成了什么——那才是 Q2 的答案。

---

## 5. 结果记录(测完填这里)

### VCF 9.0

| 项 | 结果 |
|----|------|
| 插件是否出现 | ⬜ 是 / ⬜ 否 |
| Q1 iframe 中文是否正常 | ⬜ PASS / ⬜ FAIL |
| Q2 宿主是否传 zh(verdict) | ⬜ ✅传了 / ⬜ ⚠️没传 |
| Q3 导航插件名语言 | ⬜ 中文 / ⬜ 英文 |
| `window.htmlClientSdk present` | ⬜ true / ⬜ false |
| 真机 url.* / sdk.* locale 原值 | `________________` |
| 截图 | (附) |

### VCF 9.1

| 项 | 结果 |
|----|------|
| 插件是否出现 | ⬜ 是 / ⬜ 否 |
| Q1 iframe 中文是否正常 | ⬜ PASS / ⬜ FAIL |
| Q2 宿主是否传 zh(verdict) | ⬜ ✅传了 / ⬜ ⚠️没传 |
| Q3 导航插件名语言 | ⬜ 中文 / ⬜ 英文 |
| `window.htmlClientSdk present` | ⬜ true / ⬜ false |
| 真机 url.* / sdk.* locale 原值 | `________________` |
| 截图 | (附) |

### 结论
- 整体分级:⬜ 完全成立 / ⬜ 成立(需自管 locale) / ⬜ 不成立
- 下一步:________________
- 把结论同步回 [HLD.md](HLD.md) §10 R1。
