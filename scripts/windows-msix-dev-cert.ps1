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

$trustedRoot = New-Object System.Security.Cryptography.X509Certificates.X509Store('Root','CurrentUser')
$trustedRoot.Open('ReadWrite')
try {
    $trustedRoot.Add($cert)
}
finally {
    $trustedRoot.Close()
}

$trustedPublisher = New-Object System.Security.Cryptography.X509Certificates.X509Store('TrustedPublisher','CurrentUser')
$trustedPublisher.Open('ReadWrite')
try {
    $trustedPublisher.Add($cert)
}
finally {
    $trustedPublisher.Close()
}

Write-Host ''
Write-Host 'PTL MSIX development trust prepared.' -ForegroundColor Green
Write-Host "Subject:    $($cert.Subject)"
Write-Host "Thumbprint: $($cert.Thumbprint)"
Write-Host "Expires:    $($cert.NotAfter)"
Write-Host "Public CER: $publicFile"
Write-Host ''
Write-Host 'This certificate is for controlled local development/UAT only; it is not a public distribution identity.' -ForegroundColor Yellow
