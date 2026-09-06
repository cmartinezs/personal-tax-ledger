param(
    [string]$PackagePath = "$env:USERPROFILE\Desktop\PTL-Store-Submission\PersonalTaxLedger-0.1.5.0-x64-store.msix",
    [string]$ReportDirectory = "$env:USERPROFILE\Desktop\PTL-Store-Submission\WACK"
)

$ErrorActionPreference = 'Stop'

$kitRoot = "${env:ProgramFiles(x86)}\Windows Kits\10\App Certification Kit"
$appCert = Join-Path $kitRoot 'appcert.exe'

if (-not (Test-Path $appCert)) {
    throw "Windows App Certification Kit no fue encontrado en '$kitRoot'. Modifica la instalacion del Windows SDK y agrega App Certification Kit."
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
    $Text | Tee-Object -FilePath $log -Append | Out-Null
    Write-Host $Text
}

function Invoke-AppCert {
    param(
        [Parameter(Mandatory=$true)][string[]]$Arguments
    )

    $tempOut = Join-Path $env:TEMP ("ptl-wack-out-" + [guid]::NewGuid().ToString('N') + '.txt')
    $tempErr = Join-Path $env:TEMP ("ptl-wack-err-" + [guid]::NewGuid().ToString('N') + '.txt')
    try {
        $proc = Start-Process -FilePath $appCert `
            -ArgumentList $Arguments `
            -Wait `
            -PassThru `
            -NoNewWindow `
            -RedirectStandardOutput $tempOut `
            -RedirectStandardError $tempErr

        foreach ($temp in @($tempOut, $tempErr)) {
            if (Test-Path $temp) {
                foreach ($line in Get-Content -LiteralPath $temp -ErrorAction SilentlyContinue) {
                    Log ([string]$line)
                }
            }
        }

        return [int]$proc.ExitCode
    }
    finally {
        Remove-Item -LiteralPath $tempOut -Force -ErrorAction SilentlyContinue
        Remove-Item -LiteralPath $tempErr -Force -ErrorAction SilentlyContinue
    }
}

'PTL - WINDOWS APP CERTIFICATION KIT' | Set-Content -LiteralPath $log -Encoding UTF8
Log "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')"
Log "Package: $PackagePath"
Log "AppCert: $appCert"
Log "Report: $report"
Log ''

Log '=== 1. RESET WACK STATE ==='
[int]$resetExit = Invoke-AppCert -Arguments @('reset')
Log "appcert reset exit code: $resetExit"
if ($resetExit -ne 0) {
    throw "appcert reset termino con codigo $resetExit"
}

Log ''
Log '=== 2. TEST STORE PACKAGE ==='
[int]$testExit = Invoke-AppCert -Arguments @('test','-appxpackagepath',$PackagePath,'-reportoutputpath',$report)
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
