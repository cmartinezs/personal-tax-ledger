import { rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packager } from '@electron/packager';
import { buildDesktopRuntime } from './build-desktop-runtime.mjs';
import {
  assertProductionWindowsSigning,
  signingSummary,
  windowsSigningConfig
} from './windows-signing.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(repoRoot, 'out');

function option(name, fallback) {
  const prefix = `--${name}=`;
  const value = process.argv.find(arg => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

const platform = option('platform', process.platform);
const arch = option('arch', process.arch === 'x64' ? 'x64' : process.arch);

const dir = buildDesktopRuntime();
rmSync(outDir, { recursive: true, force: true });

const packagerOptions = {
  dir,
  name: 'Personal Tax Ledger',
  executableName: 'PersonalTaxLedger',
  platform,
  arch,
  out: outDir,
  overwrite: true,
  electronVersion: '44.2.0',
  asar: true,
  // The staging runtime is already pruned deterministically by
  // build-desktop-runtime.mjs. Packager-level pruning treats the manually
  // materialized @personal-tax-ledger/* packages as extraneous because the
  // staging package.json intentionally does not model them as installable npm
  // dependencies, so enabling it removes required runtime modules.
  prune: false
};

if (platform === 'win32') {
  assertProductionWindowsSigning();
  const windowsSign = windowsSigningConfig();
  if (windowsSign) packagerOptions.windowsSign = windowsSign;

  const summary = signingSummary();
  console.log(`Windows signing: ${summary.enabled ? `enabled (${summary.mode})` : 'disabled'}`);
  console.log(`Windows signing required: ${summary.required ? 'yes' : 'no'}`);
  if (summary.enabled) console.log(`Windows timestamp server: ${summary.timestampServer}`);
}

const paths = await packager(packagerOptions);

console.log('desktop package created:');
for (const path of paths) console.log(`- ${path}`);
