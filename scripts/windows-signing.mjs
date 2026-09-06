import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const SUPPORTED_MODES = new Set(['off', 'pfx', 'params']);
const DEFAULT_TIMESTAMP_SERVER = 'http://timestamp.digicert.com';

function env(name) {
  const value = process.env[name];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function windowsSigningMode() {
  const mode = (env('PTL_WINDOWS_SIGNING_MODE') || 'off').toLowerCase();
  if (!SUPPORTED_MODES.has(mode)) {
    throw new Error(`PTL_WINDOWS_SIGNING_MODE inválido: ${mode}. Usa off, pfx o params.`);
  }
  return mode;
}

export function windowsSigningEnabled() {
  return windowsSigningMode() !== 'off';
}

export function windowsSigningConfig() {
  const mode = windowsSigningMode();
  if (mode === 'off') return undefined;

  const timestampServer = env('PTL_WINDOWS_TIMESTAMP_SERVER') || DEFAULT_TIMESTAMP_SERVER;
  const base = {
    description: 'Personal Tax Ledger',
    timestampServer,
    hashes: ['sha256'],
    debug: env('PTL_WINDOWS_SIGNING_DEBUG') === '1'
  };

  if (mode === 'pfx') {
    const certificateFileRaw = env('PTL_WINDOWS_CERTIFICATE_FILE');
    const certificatePassword = env('PTL_WINDOWS_CERTIFICATE_PASSWORD');
    if (!certificateFileRaw) {
      throw new Error('PTL_WINDOWS_CERTIFICATE_FILE es obligatorio cuando PTL_WINDOWS_SIGNING_MODE=pfx.');
    }
    const certificateFile = resolve(certificateFileRaw);
    if (!existsSync(certificateFile)) {
      throw new Error(`No existe el certificado PFX configurado: ${certificateFile}`);
    }
    if (!certificatePassword) {
      throw new Error('PTL_WINDOWS_CERTIFICATE_PASSWORD es obligatorio cuando PTL_WINDOWS_SIGNING_MODE=pfx.');
    }
    return {
      ...base,
      certificateFile,
      certificatePassword,
      automaticallySelectCertificate: true
    };
  }

  const signWithParams = env('PTL_WINDOWS_SIGN_WITH_PARAMS');
  if (!signWithParams) {
    throw new Error('PTL_WINDOWS_SIGN_WITH_PARAMS es obligatorio cuando PTL_WINDOWS_SIGNING_MODE=params.');
  }
  return {
    ...base,
    signWithParams,
    automaticallySelectCertificate: false
  };
}

export function assertProductionWindowsSigning() {
  if (env('PTL_REQUIRE_WINDOWS_SIGNING') !== '1') return;
  if (!windowsSigningEnabled()) {
    throw new Error('PTL_REQUIRE_WINDOWS_SIGNING=1 exige firma Windows; configura PTL_WINDOWS_SIGNING_MODE=pfx o params.');
  }
}

export function signingSummary() {
  const mode = windowsSigningMode();
  return {
    enabled: mode !== 'off',
    mode,
    timestampServer: env('PTL_WINDOWS_TIMESTAMP_SERVER') || DEFAULT_TIMESTAMP_SERVER,
    required: env('PTL_REQUIRE_WINDOWS_SIGNING') === '1'
  };
}
