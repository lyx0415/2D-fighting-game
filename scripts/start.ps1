$ErrorActionPreference='Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw '请先安装 Node.js 22.12+ 或 24 LTS。' }
if (-not (Test-Path -LiteralPath 'node_modules')) { & npm.cmd ci; if ($LASTEXITCODE -ne 0) { throw '依赖安装失败。' } }
# Always build before launch so source fixes cannot be hidden by an older dist.
& npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw '构建失败，未启动过期版本。' }
Write-Host '灰烬誓约：电脑访问 http://localhost:4173/；手机连接同一Wi-Fi后使用终端显示的局域网地址。'
Write-Host '此窗口负责运行游戏服务，关闭窗口会停止服务。'
& npm.cmd run preview -- --port 4173 --strictPort --open
