$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$productRoot = Join-Path $projectRoot '.easywall/product'
function Start-EasywallComponent($Port, $EntryPoint, $StartScript) {
    $listeners = @(Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue)
    if ($listeners.Count -gt 0) {
        foreach ($listener in $listeners) {
            $running = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
            if (!$running -or $running.Name -ne 'node.exe' -or !$running.CommandLine.Contains($EntryPoint)) {
                throw "Port $Port belongs to another process."
            }
        }
        Write-Output "Easywall component already running on port $Port."
        return
    }
    & $StartScript
    if (!$?) { throw "Failed to start component on port $Port." }
    $deadline = (Get-Date).AddSeconds(60)
    do {
        if (Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue) { return }
        Start-Sleep -Milliseconds 500
    } while ((Get-Date) -lt $deadline)
    throw "Component on port $Port did not start. Check its logs."
}
$backendSettingsJson = & node -e 'console.log(JSON.stringify(require(process.argv[1]).settings))' (Join-Path $projectRoot 'meshcentral-data/config.json')
if ($LASTEXITCODE -ne 0) { throw 'Failed to read backend configuration.' }
$backendSettings = $backendSettingsJson | ConvertFrom-Json
$product = Get-Content (Join-Path $productRoot 'runtime/config.json') -Raw | ConvertFrom-Json
Start-EasywallComponent $backendSettings.port (Join-Path $projectRoot 'meshcentral.js') (Join-Path $projectRoot 'easywall/Start-Lab.ps1')
Start-EasywallComponent $product.port (Join-Path $productRoot 'src/server.cjs') (Join-Path $productRoot 'scripts/Start-Dev.ps1')
$officialUrl = "http://127.0.0.1:$($product.port)"
$health = Invoke-RestMethod "$officialUrl/api/v1/health" -TimeoutSec 10
if ($health.service -ne 'easywall-control-room' -or $health.status -ne 'running') { throw 'Control Room health check failed.' }
Write-Output "Official Easywall Control Room: $officialUrl"
