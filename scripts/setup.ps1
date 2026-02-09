#region agent log helpers
$logPath = "c:\Users\kyle\Party Planning App\.cursor\debug.log"
$logDir = Split-Path $logPath -Parent
if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}
$runId = "pre-fix"
function Write-DebugLog {
  param(
    [string]$hypothesisId,
    [string]$location,
    [string]$message,
    [hashtable]$data
  )
  $payload = @{
    id = "log_{0}_{1}" -f ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()), $hypothesisId
    timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    location = $location
    message = $message
    data = $data
    runId = $runId
    hypothesisId = $hypothesisId
  }
  $json = $payload | ConvertTo-Json -Compress
  $scriptDirLog = Join-Path (Split-Path $PSCommandPath -Parent) "setup.debug.log"
  $primaryError = $null
  try {
    Add-Content -Path $logPath -Value $json
  } catch {
    $primaryError = $_.Exception.Message
  }
  try {
    Add-Content -Path $scriptDirLog -Value $json
  } catch {
    $fallbackPath = "c:\Users\kyle\Party Planning App\debug_fallback.log"
    $errPayload = @{
      timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
      location = "scripts/setup.ps1:Write-DebugLog"
      message = "debug_log_write_failed"
      data = @{
        errorPrimary = $primaryError
        errorSecondary = $_.Exception.Message
        logPath = $logPath
        scriptDirLog = $scriptDirLog
      }
    }
    $errJson = $errPayload | ConvertTo-Json -Compress
    Add-Content -Path $fallbackPath -Value $errJson
  }
}
#endregion

#region agent log start
Write-DebugLog "A" "scripts/setup.ps1:1" "script_start" @{
  args = $args
  psCommandPath = $PSCommandPath
  invocationPath = $MyInvocation.MyCommand.Path
}
#endregion

#region agent log command resolution
$npmCmd = Get-Command npm -ErrorAction SilentlyContinue
Write-DebugLog "A" "scripts/setup.ps1:16" "npm_command" @{
  name = $npmCmd.Name
  type = $npmCmd.CommandType
  source = $npmCmd.Source
}
#endregion

#region agent log npm install
Write-DebugLog "C" "scripts/setup.ps1:24" "npm_install_start" @{}
& npm install
$exitCode = $LASTEXITCODE
Write-DebugLog "C" "scripts/setup.ps1:27" "npm_install_end" @{ exitCode = $exitCode }
#endregion

#region agent log npm dev install
$devPackages = "tailwindcss @tailwindcss/vite react-router-dom lucide-react date-fns uuid @types/uuid"
Write-DebugLog "C" "scripts/setup.ps1:34" "npm_install_dev_start" @{ packages = $devPackages }
& npm install -D tailwindcss @tailwindcss/vite react-router-dom lucide-react date-fns uuid @types/uuid
$exitCode2 = $LASTEXITCODE
Write-DebugLog "C" "scripts/setup.ps1:37" "npm_install_dev_end" @{ exitCode = $exitCode2 }
#endregion
