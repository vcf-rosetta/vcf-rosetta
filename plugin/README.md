# plugin — VCF Rosetta 中文运维助手(vSphere Client 远程插件)

部署进 VCF 9.0 / 9.1 的 **remote plug-in**,在 vCenter 里提供原生中文的运维视图。
做的是浏览器翻译做不到的事(解释/语义),而非翻译宿主界面(沙箱限制,翻译交给 `../browser-extension/`)。

## 插件 4 个页面

| 页面 | 内容 | 数据 |
|------|------|------|
| 资产总览 | 集群/主机/虚拟机/数据存储 计数 | 实时(vCenter REST,best-effort) |
| 最近任务 | 任务名/状态中文化 | 实时(best-effort) |
| 告警解释 | 告警 → 中文症状/原因/建议 | 内置库(离线) |
| 术语查询 | 12,871 条英↔中检索 | 内置词表(离线) |

## 目录

```
plugin/
├── manifest/plugin.json     # 远程插件清单(9.0/9.1,zh-CN i18n)
├── ui/                      # 前端:index.html + app.js + app.css + vc-api.js
├── server/serve.mjs         # HTTPS 服务(托管 plugin.zip)
│   └── install-service.sh   # 装成 systemd 服务(开机自启)
├── i18n/                    # 术语词表(glossary.zh-CN.json 等)
├── semantics/               # 告警解释库
├── scripts/                 # build-zip / gen-cert / get-thumbprint / register-api
├── serve.sh                 # 一键前台启动
└── r1.env(本地,不入库)     # 配置:PLUGIN_HOST / VC_HOST / VC_USER / PORT
```

---

## 部署:三步

### 1) 一次性准备
```bash
cd plugin
cp r1.env.example r1.env          # 填 PLUGIN_HOST / VC_HOST / VC_USER(PORT 默认 8443)
python3 -m venv .venv && source .venv/bin/activate && pip install "pyvmomi>=8.0"   # 仅注册需要
```

### 2) 启动插件服务(二选一)

**A. 持久(推荐,开机自启 + 崩溃自拉 + 一键重启):**
```bash
bash server/install-service.sh
# 之后:sudo systemctl restart vcf-rosetta-plugin
#       sudo systemctl status  vcf-rosetta-plugin
#       journalctl -u vcf-rosetta-plugin -f
```

**B. 临时(前台,关终端即停):**
```bash
bash serve.sh
```
两种都会自动:缺证书就生成、缺 `plugin.zip` 就构建。

### 3) 注册到 vCenter(一次,改版本后重做)
```bash
source .venv/bin/activate
export VC_HOST=vc.knight.com VC_USER=administrator@vsphere.local
export PLUGIN_HOST=$(hostname -f) PORT=8443
export PLUGIN_URL=https://$PLUGIN_HOST:$PORT/plugin.zip
export THUMBPRINT=$(bash scripts/get-thumbprint.sh localhost $PORT)
python scripts/register-api.py register
```
然后在 vCenter 触发部署:
```bash
ssh root@<vCenter> 'rm -rf /etc/vmware/vsphere-ui/vc-packages/vsphere-client-serenity/com.vcfrosetta.r1probe-* && service-control --restart vsphere-ui'
```
重登 vSphere Client → vCenter 根对象 → 监控 → 「中文运维助手」。

---

## 改了内容怎么更新

```bash
git pull
bash scripts/build-zip.sh                          # 重建 plugin.zip
sudo systemctl restart vcf-rosetta-plugin           # 重启服务用新包(systemd 方式)
# 版本变更时:bump register-api 版本 -> unregister -> register -> 清 vCenter 缓存 + 重启 vsphere-ui
```

## 重启 / 重启机器后

- 服务:`sudo systemctl restart vcf-rosetta-plugin`
- **机器重启后**:systemd 已设开机自启,**无需手动操作**,服务自动恢复。
- 验证:`curl -kI --noproxy '*' https://localhost:8443/plugin.zip` 应返回 200。

## 排错

| 现象 | 处理 |
|------|------|
| 插件不显示 | 看 `journalctl -u vcf-rosetta-plugin`;确认 vCenter 能连 `PLUGIN_HOST:8443` |
| thumbprint 不匹配 | 证书变了 → 用新 thumbprint 重新 register |
| 部署 INCOMPATIBLE | 看 vsphere-ui 日志 `grep -i vcfrosetta …`(manifest 问题) |

详细排障见 [../docs/QUICKSTART-R1.md](../docs/QUICKSTART-R1.md)。
