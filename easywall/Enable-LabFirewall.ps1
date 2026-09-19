# Run in an Administrator PowerShell on the SERVER only.
#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$settingsJson = & node -e 'console.log(JSON.stringify(require(process.argv[1]).settings))' (Join-Path $projectRoot 'meshcentral-data/config.json')
$settings = $settingsJson | ConvertFrom-Json
if (!(Get-NetFirewallRule -Name 'Easywall-Lab-4430' -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -Name 'Easywall-Lab-4430' -DisplayName 'Easywall Lab HTTPS - local subnet' -Direction Inbound -Action Allow -Protocol TCP -LocalPort $settings.port -LocalAddress $settings.portBind -RemoteAddress LocalSubnet -Profile Any | Out-Null
}
Write-Output 'Easywall firewall ready for local subnet.'
