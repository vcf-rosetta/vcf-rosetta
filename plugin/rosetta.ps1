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
  $princ   = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
  Register-ScheduledTask -TaskName $Task -Action $action -Trigger $trigger -Settings $set -Principal $princ -Force | Out-Null
  Start-ScheduledTask -TaskName $Task
  Start-Sleep 2; Ok "计划任务已注册并启动(开机自启)"; Cmd-Status
  Write-Host "下一步:.\rosetta.ps1 register"
}
function Cmd-Restart { Stop-ScheduledTask -TaskName $Task -ErrorAction SilentlyContinue; Start-ScheduledTask -TaskName $Task; Start-Sleep 2; Ok "已重启"; Cmd-Status }
function Cmd-Stop    { Stop-ScheduledTask -TaskName $Task -ErrorAction SilentlyContinue; Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $Node } | Stop-Process -Force -ErrorAction SilentlyContinue; Ok "已停止" }
function Cmd-Status  {
  $t = Get-ScheduledTask -TaskName $Task -ErrorAction SilentlyContinue
  if ($t) { Ok "计划任务状态:$((Get-ScheduledTask -TaskName $Task | Get-ScheduledTaskInfo).LastTaskResult)" } else { Warn "计划任务未安装" }
  try {
    $r = Invoke-WebRequest -Uri "https://localhost:$Port/plugin.json" -Method Head -SkipCertificateCheck -TimeoutSec 5 -ErrorAction Stop
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
