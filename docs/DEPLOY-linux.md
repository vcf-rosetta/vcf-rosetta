# Linux 部署指南 — vcf-rosetta vSphere 插件

本文覆盖主流发行版。**逻辑完全一样**:装依赖 → 拉代码 → 配 `r1.env` → `rosetta.sh install` → 放行端口 → `register`。
各发行版只有 **3 处不同**:包管理器、Node 来源、防火墙命令。`rosetta.sh` 会自动识别 systemd,其余统一。

> 前提:这台机要能被 vCenter 通过 `https://<PLUGIN_HOST>:8443` 访问到(DNS 可解析或用 IP)。
> 需要 **Node ≥ 18**;发行版自带的 node 过低时用各节给出的 NodeSource/模块方式装新版。

---

## 通用步骤(所有发行版)
```bash
# 2) 拉代码(私有仓库 → 先 gh 登录或配 SSH)
gh auth login
git clone https://github.com/vcf-rosetta/vcf-rosetta.git
cd vcf-rosetta/plugin

# 3) 配置
cp r1.env.example r1.env
$EDITOR r1.env        # 填 PLUGIN_HOST / VC_HOST / VC_USER(别留 your-domain.com)

# 4) 安装并启动(systemd 开机自启)
bash rosetta.sh install
bash rosetta.sh status        # 必须 200

# 5) 注册到 vCenter(API 方式,免 SDK/Java)
bash rosetta.sh register
python3 scripts/register-api.py list

# 6) 完全登出再登录 vSphere Client,打开 VCF Rosetta
```
不同的只是**第 1 步装依赖**和**放行端口**,见下方各发行版。

---

## Ubuntu / Debian
```bash
sudo apt update
sudo apt install -y nodejs npm openssl zip curl git python3-pip
node -v    # < 18 则用 NodeSource:
#   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs
# 放行端口(ufw):
sudo ufw allow 8443/tcp
```

## RHEL / CentOS Stream / Rocky / AlmaLinux
```bash
sudo dnf install -y nodejs openssl zip curl git python3-pip
node -v    # < 18 则用模块或 NodeSource:
#   sudo dnf module reset nodejs -y && sudo dnf module enable nodejs:20 -y && sudo dnf install -y nodejs
#   或 curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash - && sudo dnf install -y nodejs
# 放行端口(firewalld):
sudo firewall-cmd --permanent --add-port=8443/tcp && sudo firewall-cmd --reload
```

## Fedora
```bash
sudo dnf install -y nodejs openssl zip curl git python3-pip
sudo firewall-cmd --permanent --add-port=8443/tcp && sudo firewall-cmd --reload
```

## openSUSE / SLES
```bash
sudo zypper install -y nodejs npm openssl zip curl git python3-pip
node -v    # < 18:sudo zypper install -y nodejs20
# 放行端口(firewalld):
sudo firewall-cmd --permanent --add-port=8443/tcp && sudo firewall-cmd --reload
```

## Arch / Manjaro
```bash
sudo pacman -Sy --needed nodejs npm openssl zip curl git python-pip
# 防火墙:多数默认无;若用 firewalld/ufw 按上面对应命令放行 8443
```

---

## 没有 systemd 的环境(容器 / 精简系统)
`rosetta.sh install` 检测不到 systemd 时会提示用 nohup 跑(无开机自启):
```bash
nohup node server/serve.mjs --cert ./certs/server.crt --key ./certs/server.key --port 8443 \
  >/tmp/vcf-rosetta-plugin.log 2>&1 &
```
或直接前台调试:`bash rosetta.sh start`。

---

## 日常运维(装好之后,所有发行版一致)
```bash
bash rosetta.sh update      # 拉新版本→重建词典+插件包→自动重启
bash rosetta.sh status      # 状态 + 200 自测
bash rosetta.sh restart     # 重启
bash rosetta.sh stop        # 停止
bash rosetta.sh uninstall   # 卸载服务(不删代码)
journalctl -u vcf-rosetta-plugin -f      # 看日志(systemd)
```

## 常见排查
| 现象 | 原因 / 处理 |
|------|------|
| `register` 连 `your-domain.com` 失败 | `r1.env` 的 `VC_HOST` 还是占位值,改成真实 vCenter |
| `restart` 报 `Unit not found` | 还没 `install`;新版会自动转 install |
| 插件不显示 | ① thumbprint 不匹配(重跑 register)② vCenter 访问不到 8443(放行端口/DNS/用 IP)③ 证书 SAN 不含 PLUGIN_HOST(删 certs 重 install) |
| `node` 版本过低报 ESM 错 | 用各发行版的 NodeSource/模块装 Node ≥ 18 |
