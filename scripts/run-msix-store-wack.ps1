param(
    [string]$PackagePath = "$env:USERPROFILE\Desktop\PTL-Store-Submission\PersonalTaxLedger-0.1.5.0-x64-store.msix",
    [string]$ReportDirectory = "$env:USERPROFILE\Desktop\PTL-Store-Submission\WACK"
)

$ErrorActionPreference = 'Stop'

$kitRoot = "${env:ProgramFiles(x86)}\Windows Kits\10\App Certification Kit"
$appCert = Join-Path $kitRoot 'appcert.exe'

if (-not (Test-Path $appCert)) {
    throw "Windows App Certification Kit no fue encontrado en '$kitRoot'. Modifica la instalación del Windows SDK y agrega App Certification Kit."
}

if (-not (Test-Path $PackagePath)) {
    throw "No existe el paquete Store: $PackagePath"
}

if (Test-Path $ReportDirectory) {
    Remove-Item -LiteralPath $ReportDirectory -Recurse -Force
}
New-Item -ItemType Directory -Path $ReportDirectory -Force | Out-Null

$report = Join-Path $ReportDirectory 'ptl-wack-report.xml'
$log = Join-Path $ReportDirectory 'ptl-wack-run.txt'

function Log([string]$Text = '') {
    $Text | Tee-Object -FilePath $log -Append
}

"PTL — WINDOWS APP CERTIFICATION KIT" | Set-Content -LiteralPath $log -Encoding UTF8
Log "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')"
Log "Package: $PackagePath"
Log "AppCert: $appCert"
Log "Report: $report"
Log ''

Log '=== 1. RESET WACK STATE ==='
& $appCert reset 2>&1 | ForEach-Object { Log ([string]$_) }
if ($LASTEXITCODE -ne 0) {
    throw "appcert reset terminó con código $LASTEXITCODE"
}

Log ''
Log '=== 2. TEST STORE PACKAGE ==='
& $appCert test -appxpackagepath $PackagePath -reportoutputpath $report 2>&1 |
    ForEach-Object { Log ([string]$_) }
$testExit = $LASTEXITCODE
Log "appcert test exit code: $testExit"

Log ''
Log '=== 3. RESULT FILES ==='
if (Test-Path $report) {
    Log "PASS: WACK report generated: $report"
} else {
    Log 'FAIL: WACK XML report not generated'
}

Get-ChildItem -LiteralPath $ReportDirectory -File -ErrorAction SilentlyContinue |
    ForEach-Object { Log ("- {0} ({1} bytes)" -f $_.FullName, $_.Length) }

Log ''
if ($testExit -eq 0) {
    Log 'PTL WACK EXECUTION: PASS'
} else {
    Log 'PTL WACK EXECUTION: REVIEW_REQUIRED'
    Log 'A non-zero WACK exit code must be reviewed before Store submission.'
}

Write-Host ''
Write-Host 'WACK finished. Send these files for review:' -ForegroundColor Green
Write-Host $log -ForegroundColor Cyan
Write-Host $report -ForegroundColor Cyan

exit $testExit
