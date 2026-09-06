param(
    [string]$StagingDirectory,
    [string]$OutputPackage
)

$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot

if (-not $StagingDirectory) {
    $StagingDirectory = Join-Path $repoRoot 'out\msix\staging'
}

if (-not (Test-Path $StagingDirectory)) {
    throw "No existe staging MSIX: $StagingDirectory"
}

$manifest = Join-Path $StagingDirectory 'AppxManifest.xml'
if (-not (Test-Path $manifest)) {
    throw "No existe AppxManifest.xml en $StagingDirectory"
}

[xml]$manifestXml = Get-Content -LiteralPath $manifest -Raw
$ns = New-Object System.Xml.XmlNamespaceManager($manifestXml.NameTable)
$ns.AddNamespace('f', 'http://schemas.microsoft.com/appx/manifest/foundation/windows10')
$identity = $manifestXml.SelectSingleNode('/f:Package/f:Identity', $ns)
if (-not $identity) {
    throw 'No fue posible resolver Identity desde AppxManifest.xml.'
}

$publisher = [string]$identity.Publisher
$version = [string]$identity.Version
$arch = [string]$identity.ProcessorArchitecture

if (-not $OutputPackage) {
    $OutputPackage = Join-Path $env:USERPROFILE "Desktop\PersonalTaxLedger-$version-$arch-sideload.msix"
}

Write-Host "MSIX sideload build"
Write-Host "Publisher: $publisher"
Write-Host "Version:   $version"
Write-Host "Arch:      $arch"
Write-Host "Output:    $OutputPackage"
Write-Host ''

& (Join-Path $scriptRoot 'windows-msix-dev-cert.ps1') -Subject $publisher
if ($LASTEXITCODE -ne 0) {
    throw "windows-msix-dev-cert.ps1 terminó con código $LASTEXITCODE"
}

& (Join-Path $scriptRoot 'package-msix.ps1') `
    -StagingDirectory $StagingDirectory `
    -OutputPackage $OutputPackage `
    -SignForDevelopment

if ($LASTEXITCODE -ne 0) {
    throw "package-msix.ps1 terminó con código $LASTEXITCODE"
}

$signature = Get-AuthenticodeSignature -FilePath $OutputPackage
if ($signature.Status -ne 'Valid') {
    throw "La firma Authenticode del MSIX no quedó válida. Estado: $($signature.Status)"
}

Write-Host ''
Write-Host 'PTL MSIX sideload artifact ready.' -ForegroundColor Green
Write-Host "Package:   $OutputPackage"
Write-Host "Signature: $($signature.Status)"
Write-Host "Signer:    $($signature.SignerCertificate.Subject)"
