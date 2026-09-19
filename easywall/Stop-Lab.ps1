$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$pidFile = Join-Path $projectRoot '.easywall/server.pid'
$serverId = [int](Get-Content $pidFile)
$serverProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $serverId"
if (!$serverProcess) { Write-Output 'Server already stopped.'; exit }
if ($serverProcess.Name -ne 'node.exe' -or !$serverProcess.CommandLine.Contains((Join-Path $projectRoot 'meshcentral.js'))) { throw 'PID does not belong to this server.' }
Stop-Process -Id $serverId
Remove-Item -LiteralPath $pidFile
