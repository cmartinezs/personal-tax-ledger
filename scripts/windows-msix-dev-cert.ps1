param(
    [string]$Subject = 'CN=Personal Tax Ledger Development',
    [int]$ValidYears = 3
)

$ErrorActionPreference = 'Stop'

$existing = Get-ChildItem Cert:\CurrentUser\My |
    Where-Object { $_.Subject -eq $Subject -and $_.HasPrivateKey -and $_.NotAfter -gt (Get-Date).AddDays(30) } |
    Sort-Object NotAfter -Descending |
    Select-Object -First 1

if ($existing) {
    Write-Host "Existing development certificate found: $($existing.Thumbprint)"
    $cert = $existing
}
else {
    $cert = New-SelfSignedCertificate `
        -Type Custom `
        -Subject $Subject `
        -KeyAlgorithm RSA `
        -KeyLength 3072 `
        -HashAlgorithm SHA256 `
        -KeyUsage DigitalSignature `
        -TextExtension @('2.5.29.37={text}1.3.6.1.5.5.7.3.3') `
        -CertStoreLocation 'Cert:\CurrentUser\My' `
        -NotAfter (Get-Date).AddYears($ValidYears)

    Write-Host "Development certificate created: $($cert.Thumbprint)"
}

$certPath = "Cert:\CurrentUser\My\$($cert.Thumbprint)"
$publicFile = Join-Path $env:USERPROFILE 'Desktop\PersonalTaxLedger-Development.cer'
Export-Certificate -Cert $certPath -FilePath $publicFile -Force | Out-Null

# App Installer validates sideload certificates against machine trust. A
# CurrentUser Root/TrustedPublisher entry is insufficient for this gate on
# current Windows 11 builds. Trust only the public certificate in LocalMachine
# TrustedPeople; keep the private key confined to CurrentUser\My.
$trustedPeople = Get-ChildItem Cert:\LocalMachine\TrustedPeople -ErrorAction SilentlyContinue |
    Where-Object { $_.Thumbprint -eq $cert.Thumbprint } |
    Select-Object -First 1

if (-not $trustedPeople) {
    Write-Host 'Installing development certificate into LocalMachine\TrustedPeople (UAC required)...'

    $escapedPublicFile = $publicFile.Replace("'", "''")
    $command = "Import-Certificate -FilePath '$escapedPublicFile' -CertStoreLocation 'Cert:\LocalMachine\TrustedPeople' | Out-Null"

    $process = Start-Process `
        -FilePath 'powershell.exe' `
        -Verb RunAs `
        -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $command) `
        -Wait `
        -PassThru

    if ($process.ExitCode -ne 0) {
        throw "No fue posible instalar el certificado de desarrollo en LocalMachine\TrustedPeople. Exit code: $($process.ExitCode)"
    }
}

$trustedPeople = Get-ChildItem Cert:\LocalMachine\TrustedPeople -ErrorAction SilentlyContinue |
    Where-Object { $_.Thumbprint -eq $cert.Thumbprint } |
    Select-Object -First 1

if (-not $trustedPeople) {
    throw 'El certificado de desarrollo no quedó presente en LocalMachine\TrustedPeople.'
}

# Remove older over-broad CurrentUser trust entries left by previous revisions.
foreach ($storePath in @('Cert:\CurrentUser\Root', 'Cert:\CurrentUser\TrustedPublisher')) {
    $legacy = Join-Path $storePath $cert.Thumbprint
    if (Test-Path $legacy) {
        Remove-Item $legacy -Force
    }
}

Write-Host ''
Write-Host 'PTL MSIX development trust prepared.' -ForegroundColor Green
Write-Host "Subject:       $($cert.Subject)"
Write-Host "Thumbprint:    $($cert.Thumbprint)"
Write-Host "Expires:       $($cert.NotAfter)"
Write-Host "Public CER:    $publicFile"
Write-Host 'Trusted store: LocalMachine\TrustedPeople'
Write-Host ''
Write-Host 'This certificate is for controlled local development/UAT only; it is not a public distribution identity.' -ForegroundColor Yellow
