param(
    [string]$RepoRoot = "\\wsl.localhost\Ubuntu\home\carlos\projects\personal-tax-ledger",
    [string]$OutputDirectory = "$env:USERPROFILE\Desktop\PTL-Store-Submission"
)

$ErrorActionPreference = 'Stop'

function Find-WindowsSdkTool {
    param([string]$ToolName)

    $roots = @(
        "${env:ProgramFiles(x86)}\Windows Kits\10\bin",
        "$env:ProgramFiles\Windows Kits\10\bin"
    ) | Where-Object { $_ -and (Test-Path $_) }

    foreach ($root in $roots) {
        $candidate = Get-ChildItem $root -Directory -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match '^\d+\.\d+\.\d+\.\d+$' } |
            Sort-Object { [version]$_.Name } -Descending |
            ForEach-Object { Join-Path $_.FullName "x64\$ToolName" } |
            Where-Object { Test-Path $_ } |
            Select-Object -First 1
        if ($candidate) { return $candidate }

        $directCandidate = Join-Path $root "x64\$ToolName"
        if (Test-Path $directCandidate) { return $directCandidate }
    }

    $pathCandidate = Get-Command $ToolName -ErrorAction SilentlyContinue
    if ($pathCandidate) { return $pathCandidate.Source }

    throw "$ToolName no fue encontrado. Instala Windows SDK en el host Windows usado para crear el paquete Store."
}

function Invoke-LoggedNative {
    param(
        [Parameter(Mandatory=$true)][string]$FilePath,
        [Parameter(Mandatory=$true)][string[]]$ArgumentList,
        [Parameter(Mandatory=$true)][string]$ReportPath
    )

    $tempOut = Join-Path $env:TEMP ("ptl-native-out-" + [guid]::NewGuid().ToString('N') + '.txt')
    $tempErr = Join-Path $env:TEMP ("ptl-native-err-" + [guid]::NewGuid().ToString('N') + '.txt')
    try {
        $proc = Start-Process -FilePath $FilePath -ArgumentList $ArgumentList -Wait -PassThru -NoNewWindow -RedirectStandardOutput $tempOut -RedirectStandardError $tempErr
        foreach ($temp in @($tempOut, $tempErr)) {
            if (Test-Path $temp) {
                Get-Content -LiteralPath $temp -ErrorAction SilentlyContinue |
                    Tee-Object -FilePath $ReportPath -Append
            }
        }
        return [int]$proc.ExitCode
    }
    finally {
        Remove-Item -LiteralPath $tempOut -Force -ErrorAction SilentlyContinue
        Remove-Item -LiteralPath $tempErr -Force -ErrorAction SilentlyContinue
    }
}

$staging = Join-Path $RepoRoot 'out\msix\staging'
$manifest = Join-Path $staging 'AppxManifest.xml'
$metadata = Join-Path $RepoRoot 'out\msix\msix-build.json'
$packageScript = Join-Path $RepoRoot 'scripts\package-msix.ps1'

foreach ($required in @($staging, $manifest, $metadata, $packageScript)) {
    if (-not (Test-Path $required)) {
        throw "Falta prerrequisito Store/MSIX: $required"
    }
}

$build = Get-Content -LiteralPath $metadata -Raw | ConvertFrom-Json
if ($build.mode -ne 'store') {
    throw "El staging actual no es Store. Ejecuta npm run desktop:msix:prepare:store en WSL antes de continuar."
}

[xml]$manifestXml = Get-Content -LiteralPath $manifest -Raw
$ns = New-Object System.Xml.XmlNamespaceManager($manifestXml.NameTable)
$ns.AddNamespace('f', 'http://schemas.microsoft.com/appx/manifest/foundation/windows10')
$identity = $manifestXml.SelectSingleNode('/f:Package/f:Identity', $ns)
$publisherDisplayName = $manifestXml.SelectSingleNode('/f:Package/f:Properties/f:PublisherDisplayName', $ns)

$expectedIdentity = 'Admn.PersonalTaxLedger'
$expectedPublisher = 'CN=5D12CBCA-3417-412D-81A4-21E062DB93F5'
$expectedDisplayName = 'Adümün'

if (-not $identity) { throw 'AppxManifest.xml no contiene Package/Identity.' }
if ([string]$identity.Name -ne $expectedIdentity) { throw "Identity Name inesperado: $($identity.Name)" }
if ([string]$identity.Publisher -ne $expectedPublisher) { throw "Publisher inesperado: $($identity.Publisher)" }
if ([string]$publisherDisplayName.InnerText -ne $expectedDisplayName) { throw "PublisherDisplayName inesperado: $($publisherDisplayName.InnerText)" }

$version = [string]$identity.Version
$arch = [string]$identity.ProcessorArchitecture
$artifactName = "PersonalTaxLedger-$version-$arch-store.msix"
$artifact = Join-Path $OutputDirectory $artifactName
$report = Join-Path $OutputDirectory 'store-submission-build.txt'
$manifestCopy = Join-Path $OutputDirectory 'AppxManifest.xml'
$metadataCopy = Join-Path $OutputDirectory 'msix-build.json'

if (Test-Path $OutputDirectory) {
    Remove-Item -LiteralPath $OutputDirectory -Recurse -Force
}
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null

function Log([string]$Text = '') {
    $Text | Tee-Object -FilePath $report -Append
}

'PTL - MICROSOFT STORE SUBMISSION BUILD' | Set-Content -LiteralPath $report -Encoding UTF8
Log "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')"
Log ''
Log "Identity:              $($identity.Name)"
Log "Publisher:             $($identity.Publisher)"
Log "PublisherDisplayName:  $($publisherDisplayName.InnerText)"
Log "Version:               $version"
Log "Architecture:          $arch"
Log "Output:                $artifact"
Log ''

Log '=== 1. CREATE STORE PACKAGE ==='
$previousPreference = $ErrorActionPreference
try {
    $ErrorActionPreference = 'Continue'
    & $packageScript -StagingDirectory $staging -OutputPackage $artifact 2>&1 |
        ForEach-Object { Log ([string]$_) }
    $packageSucceeded = $?
}
finally {
    $ErrorActionPreference = $previousPreference
}

if (-not $packageSucceeded -or -not (Test-Path $artifact)) {
    throw "No se creó el artefacto Store esperado: $artifact"
}

Log ''
Log '=== 2. ARTIFACT INTEGRITY ==='
$item = Get-Item -LiteralPath $artifact
$hash = Get-FileHash -LiteralPath $artifact -Algorithm SHA256
$signature = Get-AuthenticodeSignature -LiteralPath $artifact
Log "Bytes:                 $($item.Length)"
Log "SHA256:                $($hash.Hash)"
Log "Authenticode status:   $($signature.Status)"
Log ''

Log '=== 3. ROUND-TRIP PACKAGE VALIDATION ==='
$makeAppx = Find-WindowsSdkTool 'MakeAppx.exe'
$temp = Join-Path $env:TEMP ("ptl-store-unpack-" + [guid]::NewGuid().ToString('N'))
try {
    New-Item -ItemType Directory -Path $temp -Force | Out-Null
    $exit = Invoke-LoggedNative -FilePath $makeAppx -ArgumentList @('unpack','/p',$artifact,'/d',$temp,'/o') -ReportPath $report
    if ($exit -ne 0) {
        throw "MakeAppx unpack terminó con código $exit"
    }

    $roundTripManifest = Join-Path $temp 'AppxManifest.xml'
    if (-not (Test-Path $roundTripManifest)) {
        throw 'El paquete reconstruido no contiene AppxManifest.xml.'
    }

    [xml]$roundTripXml = Get-Content -LiteralPath $roundTripManifest -Raw
    $roundTripNs = New-Object System.Xml.XmlNamespaceManager($roundTripXml.NameTable)
    $roundTripNs.AddNamespace('f', 'http://schemas.microsoft.com/appx/manifest/foundation/windows10')
    $roundTripIdentity = $roundTripXml.SelectSingleNode('/f:Package/f:Identity', $roundTripNs)

    if ([string]$roundTripIdentity.Name -ne $expectedIdentity) { throw 'Round-trip identity mismatch.' }
    if ([string]$roundTripIdentity.Publisher -ne $expectedPublisher) { throw 'Round-trip publisher mismatch.' }
    if ([string]$roundTripIdentity.Version -ne $version) { throw 'Round-trip version mismatch.' }
    if ([string]$roundTripIdentity.ProcessorArchitecture -ne $arch) { throw 'Round-trip architecture mismatch.' }

    Log 'PASS: package round-trip identity/version/architecture'
}
finally {
    Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue
}

Copy-Item -LiteralPath $manifest -Destination $manifestCopy -Force
Copy-Item -LiteralPath $metadata -Destination $metadataCopy -Force

Log ''
Log '=== 4. STORE SUBMISSION READY ==='
Log "Package: $artifact"
Log "Manifest copy: $manifestCopy"
Log "Metadata copy: $metadataCopy"
Log "Report: $report"
Log 'PTL MICROSOFT STORE SUBMISSION BUILD: PASS'

Write-Host ''
Write-Host 'Microsoft Store submission artifact ready:' -ForegroundColor Green
Write-Host $artifact -ForegroundColor Cyan
Write-Host 'Upload this .msix in Partner Center > Packages.' -ForegroundColor Cyan
