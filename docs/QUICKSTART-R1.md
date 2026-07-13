# R1 从零跑通 — 清单式 runbook

> 在 lab 机(跑 node 的那台,例 `student01@dc`)上从头执行。
> 两个终端:**A** 跑插件服务(常开),**B** 做配置和注册。

---

## 第 0 步:选定主机地址(最关键的决定)

vCenter 注册后要主动来拉插件,所以必须用一个 **vCenter 能访问到的地址**。
先确认 vCenter 能不能解析你的域名:

```bash
# 在 vCenter 或其同网段执行:
nslookup dc.vclass.local
```
- 能解析到插件机 IP → 用 **`dc.vclass.local`**
- 不能解析 → 用插件机的 **IP**(在插件机上 `hostname -I` 查,例 `172.20.10.50`)

下面统一用占位 `PLUGIN_HOST`,替换成你定的值(域名或 IP)。

---

## 第 1 步【终端 B】清理旧状态(避免互相干扰)

```bash
cd ~/vcf-rosetta && git pull && cd plugin

# 注销可能存在的旧注册(没有也无妨)
VC_HOST=vc.example.com VC_USER=administrator@vsphere.local \
  python3 scripts/register-api.py unregister 2>/dev/null || true

# 删旧证书,重新来
rm -rf certs
```

---

## 第 2 步【终端 B】生成证书(SAN 自动匹配)

```bash
bash scripts/gen-cert.sh <PLUGIN_HOST>
# 例:bash scripts/gen-cert.sh dc.vclass.local
#  或:bash scripts/gen-cert.sh 172.20.10.50
```
记下打印的 thumbprint(后面会自动取,不用手抄)。

---

## 第 3 步【终端 A】启动插件服务(常开,别关)

```bash
cd ~/vcf-rosetta/plugin
node server/serve.mjs --cert ./certs/server.crt --key ./certs/server.key --port 8443
```
看到 `R1 plug-in server on https://0.0.0.0:8443` 即可。

---

## 第 4 步【终端 B】本机自测(必须先过这关)

```bash
curl -kI --noproxy '*' --max-time 5 https://localhost:8443/plugin.json
```
要返回 `HTTP/1.1 200 OK`。不过 → 回终端 A 看 node 报错,别往下走。

---

## 第 5 步【vCenter 侧】确认 vCenter 能连到插件机(最易踩的坑)

在 vCenter 能访问的地方执行:
```bash
curl -kI --noproxy '*' --max-time 5 https://<PLUGIN_HOST>:8443/plugin.json
```
- 返回 200 → 通,继续
- 超时/连不上 → 防火墙或 DNS 问题:
  ```bash
  sudo ufw allow 8443/tcp        # 在插件机放行端口
  ```
  DNS 不通就改用 IP 重做第 2 步。

---

## 第 6 步【终端 B】准备 Python 环境(只需一次)

```bash
cd ~/vcf-rosetta/plugin
sudo apt install -y python3-venv          # 没有 venv 才需要
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install "pyvmomi>=8.0"                 # 必须 8+,apt 的 6.7 在 py3.12 会崩
python -c "import pyVmomi; from pyVim.connect import SmartConnect; print('pyvmomi OK', pyVmomi.__version__)"
```
看到 `pyvmomi OK 8.x` 才算好。

---

## 第 7 步【终端 B】注册(指纹自动取,保证一致)

```bash
# venv 仍激活状态下:
export VC_HOST=vc.example.com
export VC_USER=administrator@vsphere.local
export PLUGIN_HOST=<PLUGIN_HOST>
export PLUGIN_URL=https://$PLUGIN_HOST:8443/plugin.json
export THUMBPRINT=$(bash scripts/get-thumbprint.sh localhost 8443)
echo "thumbprint = $THUMBPRINT"           # 不应为空

python scripts/register-api.py register   # 输 vCenter 密码
python scripts/register-api.py list       # 应打印 FOUND com.vcfrosetta.r1probe
```

---

## 第 8 步【vSphere Client】看结果

1. **退出并重新登录** vSphere Client(`Shift+F5` 清缓存)
2. **Administration → Solutions → Client Plug-Ins** → 找 `com.vcfrosetta.r1probe`,看状态
   - Enabled/Deployed → 去 ☰ 菜单 / 首页 Shortcuts 找 "VCF Rosetta(R1 验证)",点开读探针
   - Failed/Incompatible → 把状态和报错截图发出来定位
3. 按 [R1-POC.md](R1-POC.md) 的判定标准记录结果

---

## 卡住时按这个顺序查

1. `curl localhost:8443` 不通 → node 没起 / 证书路径错
2. vCenter 侧 `curl PLUGIN_HOST:8443` 不通 → 防火墙 / DNS
3. `list` 不是 FOUND → 注册没成功,看 register 报错
4. FOUND 但 UI 没有 → 没重登 / vCenter 拉不到 / manifest schema 不符(看 Client Plug-Ins 报错)
