# Run only after GitHub CLI login; no token is stored in this project.
$ErrorActionPreference='Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
$cli=Get-Command gh -ErrorAction SilentlyContinue
$ghPath=if($cli){$cli.Source}else{Join-Path (Get-Location) '.cache/github-cli/bin/gh.exe'}
if(!(Test-Path -LiteralPath $ghPath)){throw 'Install the official GitHub CLI, then run gh auth login.'}
& $ghPath auth status
if($LASTEXITCODE -ne 0){throw 'Run gh auth login first.'}
$account=& $ghPath api user --jq .login
if($LASTEXITCODE -ne 0){throw 'Cannot read authenticated account.'}
$repo="$account/2D-fighting-game"
if(git remote get-url origin 2>$null){throw 'An origin remote already exists. Inspect it before continuing.'}
& $ghPath repo create $repo --private --source . --remote origin --push --description '2D fighting game · 灰烬誓约：暗黑中世纪四人小队，第一章十关、五职业、装备修习、远征契约、移动触控与离线PWA。v0.13发布候选；真机/商店上线待验收。'
if($LASTEXITCODE -ne 0){throw 'Repository creation or push failed; inspect GitHub and origin before retrying.'}
& $ghPath repo view $repo --json url,visibility,description
