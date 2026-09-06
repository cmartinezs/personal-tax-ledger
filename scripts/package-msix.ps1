param(
    [Parameter(Mandatory=$true)]
    [string]$StagingDirectory,

    [Parameter(Mandatory=$true)]
    [string]$OutputPackage,

    [switch]$SignForDevelopment,

    [string]$CertificateSubject = 'CN=Personal Tax Ledger Development'
)

$ErrorActionPreference = 'Stop'

function Find-WindowsSdkTool {
    param([string]$ToolName)

    $roots = @(
        "$env:ProgramFiles(x86)\Windows Kits\10\bin",
        "$env:ProgramFiles\Windows Kits\10\bin"
    ) | Where-Object { $_ -and (Test-Path $_) }

    foreach ($root in $roots) {
        $candidate = Get-ChildItem $root -Directory -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending |
            ForEach-Object { Join-Path $_.FullName "x64\$ToolName" } |
            Where-Object { Test-Path $_ } |
            Select-Object -First 1
        if ($candidate) { return $candidate }
    }

    $pathCandidate = Get-Command $ToolName -ErrorAction SilentlyContinue
    if ($pathCandidate) { return $pathCandidate.Source }

    throw "$ToolName no fue encontrado. Instala Windows SDK (solo Packaging Tools) en el host usado para construir MSIX."
}

if (-not (Test-Path $StagingDirectory)) {
    throw "No existe staging MSIX: $StagingDirectory"
}

$manifest = Join-Path $StagingDirectory 'AppxManifest.xml'
if (-not (Test-Path $manifest)) {
    throw "No existe AppxManifest.xml en $StagingDirectory"
}

$makeAppx = Find-WindowsSdkTool 'MakeAppx.exe'
$signTool = $null
if ($SignForDevelopment) {
    $signTool = Find-WindowsSdkTool 'SignTool.exe'
}

$outDir = Split-Path -Parent $OutputPackage
if ($outDir -and -not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}
if (Test-Path $OutputPackage) {
    Remove-Item $OutputPackage -Force
}

Write-Host "MakeAppx: $makeAppx"
Write-Host "Staging:  $StagingDirectory"
Write-Host "Output:   $OutputPackage"

& $makeAppx pack /d $StagingDirectory /p $OutputPackage /o
if ($LASTEXITCODE -ne 0) {
    throw "MakeAppx.exe terminó con código $LASTEXITCODE"
}

if ($SignForDevelopment) {
    $cert = Get-ChildItem Cert:\CurrentUser\My |
        Where-Object { $_.Subject -eq $CertificateSubject -and $_.HasPrivateKey } |
        Sort-Object NotAfter -Descending |
        Select-Object -First 1

    if (-not $cert) {
        throw "No existe certificado de desarrollo con private key y Subject '$CertificateSubject'. Ejecuta scripts/windows-msix-dev-cert.ps1 primero."
    }

    Write-Host "Signing development MSIX with certificate thumbprint $($cert.Thumbprint)"
    & $signTool sign /fd SHA256 /sha1 $cert.Thumbprint $OutputPackage
    if ($LASTEXITCODE -ne 0) {
        throw "SignTool.exe terminó con código $LASTEXITCODE"
    }
}

Write-Host "MSIX created: $OutputPackage"
