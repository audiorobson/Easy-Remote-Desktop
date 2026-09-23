$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$dataDir = Join-Path $projectRoot 'meshcentral-data'
$runtimeDir = Join-Path $projectRoot '.easywall'
$settingsJson = & node -e 'console.log(JSON.stringify(require(process.argv[1]).settings))' (Join-Path $dataDir 'config.json')
$config = @{ settings = ($settingsJson | ConvertFrom-Json) }
$listener = Get-NetTCPConnection -State Listen -LocalPort $config.settings.port -ErrorAction SilentlyContinue
if ($listener) { throw 'Port already listening. Check the existing server before starting another.' }
$nodePath = (Get-Command node.exe).Source
$arguments = '"' + (Join-Path $projectRoot 'meshcentral.js') + '" --datapath "' + $dataDir + '" --filespath "' + (Join-Path $projectRoot 'meshcentral-files') + '"'
$serverProcess = Start-Process -FilePath $nodePath -ArgumentList $arguments -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtimeDir 'server.log') -RedirectStandardError (Join-Path $runtimeDir 'server-error.log') -PassThru
$serverProcess.Id | Set-Content (Join-Path $runtimeDir 'server.pid')
Write-Output "MeshCentral backend started: $($serverProcess.Id). Agent endpoint: https://$($config.settings.cert):$($config.settings.port). Official panel: http://127.0.0.1:4070/ (start both with Start-Easywall.ps1)."
