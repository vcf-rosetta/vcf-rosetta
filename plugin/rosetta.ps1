<#
  vcf-rosetta 插件统一管理 CLI(Windows / PowerShell)。
  与 rosetta.sh 对应,Windows 上用「计划任务(开机启动)」代替 systemd。

  用法(在 plugin\ 目录,PowerShell):
    .\rosetta.ps1 install     # 查依赖→证书→打包→注册开机启动计划任务并立即启动
    .\rosetta.ps1 start       # 前台启动(调试,Ctrl-C 退出)
    .\rosetta.ps1 restart     # 重启计划任务
    .\rosetta.ps1 stop        # 停止
    .\rosetta.ps1 status      # 状态 + 本机自测 200
    .\rosetta.ps1 update      # 拉代码→重建词典/插件包→重启
    .\rosetta.ps1 register    # 向 vCenter 注册(需 Java + SDK_TOOL)
    .\rosetta.ps1 uninstall   # 删除计划任务

  配置:把 r1.env 的键设为环境变量,或在本会话里 $env:PLUGIN_HOST='dc.vclass.local' 等。
    PLUGIN_HOST(缺省=本机 FQDN)、PORT(缺省 8443)、VC_HOST/VC_USER/SDK_TOOL(仅 register)
  依赖:Node 18+、OpenSSL(随 Git for Windows 自带)、PowerShell 5+。
  运行(勿改全局执行策略):以管理员开 PowerShell,用
    powershell -ExecutionPolicy Bypass -File .\rosetta.ps1 install
  install 需要管理员(注册计划任务);任务本身以「当前用户」最小权限身份运行,非 SYSTEM。
#>
param([Parameter(Position=0)][string]$Cmd = "help")
$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

$Task = "vcf-rosetta-plugin"
function Ok($m){ Write-Host "  [OK] $m" -ForegroundColor Green }
function Warn($m){ Write-Host "  [!]  $m" -ForegroundColor Yellow }
function Die($m){ Write-Host "  [x]  $m" -ForegroundColor Red; exit 1 }

# r1.env(KEY=VALUE)载入为环境变量(已存在的不覆盖)
if (Test-Path r1.env) {
  Get-Content r1.env | Where-Object { $_ -match '^\s*[^#].*=' } | ForEach-Object {
    $k,$v = $_ -split '=',2
    if (-not [Environment]::GetEnvironmentVariable($k.Trim())) { Set-Item -Path "env:$($k.Trim())" -Value $v.Trim() }
  }
}
$Port = if ($env:PORT) { $env:PORT } else { "8443" }
$PluginHost = if ($env:PLUGIN_HOST) { $env:PLUGIN_HOST } else { [System.Net.Dns]::GetHostEntry($env:COMPUTERNAME).HostName }
$Node = (Get-Command node -ErrorAction SilentlyContinue).Source
$Dir  = $PSScriptRoot

function Ensure-Deps {
  if (-not $Node) { Die "缺 node(需 18+)" }; Ok "node $(node -v)"
  if (-not (Get-Command openssl -ErrorAction SilentlyContinue)) { Die "缺 openssl(装 Git for Windows 即带)" }; Ok "openssl 就绪"
}
function Ensure-Cert {
  $crt = Join-Path $Dir "certs\server.crt"
  if ((Test-Path $crt) -and (openssl x509 -in $crt -noout -text 2>$null | Select-String "DNS:$PluginHost|IP Address:$PluginHost")) {
    Ok "证书已覆盖 $PluginHost"
  } else {
    & bash scripts/gen-cert.sh $PluginHost ./certs | Out-Null   # 复用同一份 openssl 脚本
    Ok "已生成证书 (SAN=$PluginHost)"
  }
}
function Ensure-Zip { & bash scripts/build-zip.sh | Out-Null; Ok "已构建 dist\plugin.zip" }
function Serve-Args { @("$Dir\server\serve.mjs","--cert","$Dir\certs\server.crt","--key","$Dir\certs\server.key","--port","$Port") }

function Cmd-Start { Ensure-Deps; Ensure-Cert; Ensure-Zip
  Ok "前台启动:https://$PluginHost`:$Port/plugin.json  (Ctrl-C 退出)"
  & $Node @(Serve-Args) }

function Cmd-Install {
  Write-Host "1) 依赖"; Ensure-Deps
  Write-Host "2) 证书"; Ensure-Cert
  Write-Host "3) 插件包"; Ensure-Zip
  Write-Host "4) 计划任务(开机启动)"
  $argline = (Serve-Args | ForEach-Object { if ($_ -match '\s') { "`"$_`"" } else { $_ } }) -join ' '
  $action  = New-ScheduledTaskAction -Execute $Node -Argument $argline -WorkingDirectory $Dir
  $trigger = New-ScheduledTaskTrigger -AtStartup
  $set     = New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
  # 最小权限:以「安装此任务的当前用户」身份运行,而非 SYSTEM。
  # 该服务只需绑定 8443 + 读本目录的证书/词典,不需要任何管理员/SYSTEM 特权;而 $Dir 通常是用户
  # 可写的克隆目录 —— 若以 SYSTEM 跑,任何能改写 serve.mjs 的普通用户代码都能在下次开机拿到 SYSTEM
  # (本地提权)。与 Linux 侧 systemd 单元用 ${SUDO_USER:-$USER} 对齐。RunLevel=Limited 不提权。
  # S4U:开机即以该用户身份运行,无需其保持登录、也无需存储明文密码(仅本地权限,无网络凭据 —— 本服务够用)。
  $me      = "$env:USERDOMAIN\$env:USERNAME"
  $princ   = New-ScheduledTaskPrincipal -UserId $me -LogonType S4U -RunLevel Limited
  Register-ScheduledTask -TaskName $Task -Action $action -Trigger $trigger -Settings $set -Principal $princ -Force | Out-Null
  Start-ScheduledTask -TaskName $Task
  Start-Sleep 2; Ok "计划任务已注册并启动(开机自启)"; Cmd-Status
  Write-Host "下一步:.\rosetta.ps1 register"
}
function Cmd-Restart { Stop-ScheduledTask -TaskName $Task -ErrorAction SilentlyContinue; Start-ScheduledTask -TaskName $Task; Start-Sleep 2; Ok "已重启"; Cmd-Status }
function Cmd-Stop    {
  Stop-ScheduledTask -TaskName $Task -ErrorAction SilentlyContinue
  # 只杀「本插件的 serve.mjs」——按命令行精确匹配,不再误杀本机其它 node 工作负载
  # (旧写法按 $_.Path -eq $Node 匹配,会连带杀掉所有从同一 node.exe 启动的进程)。
  Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like '*server\serve.mjs*' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  Ok "已停止"
}
function Cmd-Status  {
  $t = Get-ScheduledTask -TaskName $Task -ErrorAction SilentlyContinue
  if ($t) { Ok "计划任务状态:$((Get-ScheduledTask -TaskName $Task | Get-ScheduledTaskInfo).LastTaskResult)" } else { Warn "计划任务未安装" }
  try {
    $uri = "https://localhost:$Port/plugin.json"
    if ($PSVersionTable.PSVersion.Major -ge 6) {
      # PowerShell 7+:原生支持跳过自签证书校验
      $r = Invoke-WebRequest -Uri $uri -Method Head -SkipCertificateCheck -TimeoutSec 5 -ErrorAction Stop
    } else {
      # Windows PowerShell 5.x 无 -SkipCertificateCheck(旧代码在 PS5 上永远抛错 → status 永远失败)。
      # 临时挂上「接受自签证书」的回调,请求后立即还原,避免污染整个会话的 TLS 校验。
      $prev = [System.Net.ServicePointManager]::ServerCertificateValidationCallback
      [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
      try { $r = Invoke-WebRequest -Uri $uri -Method Head -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop }
      finally { [System.Net.ServicePointManager]::ServerCertificateValidationCallback = $prev }
    }
    if ($r.StatusCode -eq 200) { Ok "本机自测 → 200" }
  } catch { Warn "本机自测未返回 200(服务可能未起或证书/端口问题)" }
}
function Cmd-Update {
  Write-Host "拉取最新代码"; try { git pull --ff-only; Ok "git 已更新" } catch { Warn "git pull 跳过" }
  Write-Host "重建词典 + 插件包"; & node ..\browser-extension\build-dict.mjs | Out-Null; Ensure-Zip
  Write-Host "重启服务"; Cmd-Restart
  Ok "更新完成(浏览器扩展请在 chrome://extensions 点『重新加载』或等商店自动更新)"
}
function Cmd-Register {
  if (-not $env:VC_HOST) { Die "设 VC_HOST" }; if (-not $env:VC_USER) { Die "设 VC_USER" }; if (-not $env:SDK_TOOL) { Die "设 SDK_TOOL" }
  if (-not (Get-Command java -ErrorAction SilentlyContinue)) { Die "缺 java(注册需 Java 17+)" }
  $thumb = (openssl x509 -in certs\server.crt -noout -fingerprint -sha256) -replace '.*=',''
  Ok "thumbprint: $thumb"
  & java -jar $env:SDK_TOOL -action registerPlugin -remote `
    -pluginUrl "https://$PluginHost`:$Port/plugin.json" `
    -k "com.vcfrosetta.r1probe" -n "VCF Rosetta R1 Probe" -v "0.1.0" -c "vcf-rosetta" `
    -vcAddress $env:VC_HOST -username $env:VC_USER -serverThumbprint $thumb
}
function Cmd-Uninstall { Unregister-ScheduledTask -TaskName $Task -Confirm:$false -ErrorAction SilentlyContinue; Ok "已删除计划任务(代码与证书保留)" }

switch ($Cmd) {
  "install"   { Cmd-Install }
  "start"     { Cmd-Start }
  "restart"   { Cmd-Restart }
  "stop"      { Cmd-Stop }
  "status"    { Cmd-Status }
  "update"    { Cmd-Update }
  "register"  { Cmd-Register }
  "uninstall" { Cmd-Uninstall }
  default     { Get-Content $PSCommandPath -TotalCount 24 | Select-Object -Skip 1 }
}
