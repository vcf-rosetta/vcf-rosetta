# Chrome 应用商店上架清单(公开上架)

## 0. 一次性准备
- [ ] 注册 Chrome Web Store 开发者账号(一次性 **$5** 注册费)。
- [ ] 准备一个公开的隐私政策 URL(把 `store/PRIVACY.md` 发布到 GitHub Pages,或用主仓库 raw 链接)。

## 1. 先发布语言包,再构建上传包
扩展包**不内置词典**(仅 ~26KB),运行时按需从**公开主仓库 `vcf-rosetta/vcf-rosetta`**(`browser-extension/dict.*.json`)经 jsDelivr 下载。**所以上架前必须先把最新词典入库主仓库并刷 jsDelivr**,否则用户装上后下不到词典、无法翻译。
```bash
node  browser-extension/build-dict.mjs            # 由 glossary.*.json 生成 dict.*.json
bash  browser-extension/scripts/publish-langpacks.sh   # 提交词典到主仓库 + 刷 jsDelivr
node  browser-extension/scripts/pack-store.mjs    # 产出轻量上传包 dist/vcf-rosetta-<version>.zip
```
- 验证 CDN 可访问:`curl -I https://cdn.jsdelivr.net/gh/vcf-rosetta/vcf-rosetta@main/browser-extension/dict.zh-CN.json` 返回 200。
- 新增语种:在 `langs.json` 登记 → 准备好 `dict.<lang>.json` → 重跑上面三步。

## 2. 素材(开发者后台要求)
- [ ] 图标 128×128:`icons/icon128.png`(已含)。
- [ ] 截图至少 1 张,1280×800 或 640×400:建议截「vCenter 摘要页翻译前/后对比」。
- [ ] (可选)小宣传图块 440×280。

## 3. 商品信息
- [ ] 名称 / 简短描述 / 详细描述 / 类别 / 语言 → 复制 `store/LISTING.md`。
- [ ] **单一用途说明**(Single purpose):见 LISTING.md。
- [ ] **权限理由**:逐条填(storage / activeTab / host access)→ 见 LISTING.md(3.4.32 起已移除未使用的 `scripting` 权限)。

## 4. 数据使用 / 隐私(Privacy practices 标签页)
- [ ] 勾选「不收集用户数据」。
- [ ] 填隐私政策 URL。
- [ ] 勾选合规声明(不出售数据、用途限制等)。

## 5. ⚠️ 审核关键风险(提前规避)
- **广域主机权限 `https://*/*`**:这是公开上架被打回的头号原因。审核员会质疑"为何需要在所有网站运行"。
  - 应对:在权限理由里据实说明——vCenter 部署在客户自有、任意主机名的内网地址,无法预先穷举;**内容脚本会先判定是否为 vCenter 控制台页面,非 vCenter 页面不加载词典、不做任何处理**(代码见 `content/translator.js` 的页面判定)。
  - 备选(若仍被拒):改为 `optional_host_permissions` + 用户在弹窗中按需对当前 vCenter 授权(`chrome.scripting.registerContentScripts`)。此改动会改变"自动生效"的体验,需产品确认后再做。
- **商标**:名称/描述已声明"与 Broadcom/VMware 无隶属关系、不分发 VMware 软件";避免使用官方 logo。
- **远程代码**:扩展不得加载远程可执行代码。若后续做"按需下载语言包",下载的必须是**纯数据 JSON**(词典),不是代码 —— 这点合规,但需在描述中说明数据来源。

## 6. 提交
- [ ] 上传 zip → 填信息 → 提交审核(首次通常数小时至数天)。
- [ ] 记录商品 ID,后续 `update` 发版在同一项目「上传新版本」即可(版本号取 `manifest.json`)。
