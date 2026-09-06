param(
    [Parameter(Mandatory=$true)]
    [string]$StagingDirectory,

    [Parameter(Mandatory=$true)]
    [string]$OutputPackage,

    [switch]$SignForDevelopment,

    [string]$CertificateSubject
)

$ErrorActionPreference = 'Stop'

function Find-WindowsSdkTool {
    param([string]$ToolName)

    $roots = @(
        "${env:ProgramFiles(x86)}\Windows Kits\10\bin",
        "$env:ProgramFiles\Windows Kits\10\bin"
    ) | Where-Object { $_ -and (Test-Path $_) }

    foreach ($root in $roots) {
        # Prefer versioned SDK directories, newest first.
        $candidate = Get-ChildItem $root -Directory -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match '^\d+\.\d+\.\d+\.\d+$' } |
            Sort-Object { [version]$_.Name } -Descending |
            ForEach-Object { Join-Path $_.FullName "x64\$ToolName" } |
            Where-Object { Test-Path $_ } |
            Select-Object -First 1
        if ($candidate) { return $candidate }

        # Some SDK installations also expose non-versioned architecture folders.
        $directCandidate = Join-Path $root "x64\$ToolName"
        if (Test-Path $directCandidate) { return $directCandidate }
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

if ($SignForDevelopment -and -not $CertificateSubject) {
    [xml]$manifestXml = Get-Content -LiteralPath $manifest -Raw
    $ns = New-Object System.Xml.XmlNamespaceManager($manifestXml.NameTable)
    $ns.AddNamespace('f', 'http://schemas.microsoft.com/appx/manifest/foundation/windows10')
    $identity = $manifestXml.SelectSingleNode('/f:Package/f:Identity', $ns)
    if (-not $identity -or -not $identity.Publisher) {
        throw 'No fue posible resolver el Publisher desde AppxManifest.xml para firma de desarrollo.'
    }
    $CertificateSubject = [string]$identity.Publisher
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
    Write-Host "Development signing subject: $CertificateSubject"
    $cert = Get-ChildItem Cert:\CurrentUser\My |
        Where-Object { $_.Subject -eq $CertificateSubject -and $_.HasPrivateKey } |
        Sort-Object NotAfter -Descending |
        Select-Object -First 1

    if (-not $cert) {
        throw "No existe certificado de desarrollo con private key y Subject '$CertificateSubject'. Ejecuta scripts/windows-msix-dev-cert.ps1 -Subject '$CertificateSubject' primero."
    }

    Write-Host "Signing development MSIX with certificate thumbprint $($cert.Thumbprint)"
    & $signTool sign /fd SHA256 /sha1 $cert.Thumbprint $OutputPackage
    if ($LASTEXITCODE -ne 0) {
        throw "SignTool.exe terminó con código $LASTEXITCODE"
    }
}

Write-Host "MSIX created: $OutputPackage"
