import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));

function env(name) {
  const value = process.env[name];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function msixVersion(version = packageJson.version) {
  const parts = String(version).split('.');
  if (parts.length > 4 || parts.some(part => !/^\d+$/.test(part))) {
    throw new Error(`Versión npm incompatible con MSIX: ${version}.`);
  }
  const normalized = [...parts, '0', '0', '0', '0'].slice(0, 4).map(Number);
  if (normalized.some(part => part < 0 || part > 65535)) {
    throw new Error(`Cada componente de versión MSIX debe estar entre 0 y 65535: ${version}.`);
  }
  return normalized.join('.');
}

export function msixConfig() {
  const mode = (env('PTL_MSIX_MODE') || 'dev').toLowerCase();
  if (!['dev', 'store'].includes(mode)) {
    throw new Error(`PTL_MSIX_MODE inválido: ${mode}. Usa dev o store.`);
  }

  const identityName = env('PTL_MSIX_IDENTITY_NAME') || (mode === 'dev' ? 'PersonalTaxLedger.Dev' : undefined);
  const publisher = env('PTL_MSIX_PUBLISHER') || (mode === 'dev' ? 'CN=Personal Tax Ledger Development' : undefined);
  const publisherDisplayName = env('PTL_MSIX_PUBLISHER_DISPLAY_NAME') || 'Personal Tax Ledger';

  if (!identityName) {
    throw new Error('PTL_MSIX_IDENTITY_NAME es obligatorio en modo store y debe coincidir con Partner Center.');
  }
  if (!publisher) {
    throw new Error('PTL_MSIX_PUBLISHER es obligatorio en modo store y debe coincidir exactamente con Partner Center.');
  }

  return {
    mode,
    identityName,
    publisher,
    publisherDisplayName,
    displayName: 'Personal Tax Ledger',
    description: 'Personal tax ledger and estimation desktop application',
    executable: 'PersonalTaxLedger.exe',
    architecture: 'x64',
    version: msixVersion(),
    minWindowsVersion: env('PTL_MSIX_MIN_WINDOWS_VERSION') || '10.0.19041.0',
    maxWindowsVersionTested: env('PTL_MSIX_MAX_WINDOWS_VERSION_TESTED') || '10.0.26200.0'
  };
}

export function createAppxManifest(config = msixConfig()) {
  const c = Object.fromEntries(Object.entries(config).map(([key, value]) => [key, xmlEscape(value)]));
  return `<?xml version="1.0" encoding="utf-8"?>
<Package
  xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
  xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities"
  IgnorableNamespaces="uap rescap">
  <Identity Name="${c.identityName}" Publisher="${c.publisher}" Version="${c.version}" ProcessorArchitecture="${c.architecture}" />
  <Properties>
    <DisplayName>${c.displayName}</DisplayName>
    <PublisherDisplayName>${c.publisherDisplayName}</PublisherDisplayName>
    <Description>${c.description}</Description>
    <Logo>Assets\\StoreLogo.png</Logo>
  </Properties>
  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="${c.minWindowsVersion}" MaxVersionTested="${c.maxWindowsVersionTested}" />
  </Dependencies>
  <Resources>
    <Resource Language="es-CL" />
    <Resource Language="en-US" />
  </Resources>
  <Applications>
    <Application Id="PTL" Executable="${c.executable}" EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements
        DisplayName="${c.displayName}"
        Description="${c.description}"
        BackgroundColor="transparent"
        Square44x44Logo="Assets\\Square44x44Logo.png"
        Square150x150Logo="Assets\\Square150x150Logo.png">
        <uap:DefaultTile Wide310x150Logo="Assets\\Wide310x150Logo.png" />
      </uap:VisualElements>
    </Application>
  </Applications>
  <Capabilities>
    <rescap:Capability Name="runFullTrust" />
  </Capabilities>
</Package>
`;
}

export function msixSummary() {
  const config = msixConfig();
  return {
    mode: config.mode,
    identityName: config.identityName,
    publisher: config.publisher,
    version: config.version,
    architecture: config.architecture
  };
}
