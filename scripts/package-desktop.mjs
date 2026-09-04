import { rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { package as packageElectron } from '@electron/packager';
import { buildDesktopRuntime } from './build-desktop-runtime.mjs';

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

const paths = await packageElectron({
  dir,
  name: 'Personal Tax Ledger',
  executableName: 'PersonalTaxLedger',
  platform,
  arch,
  out: outDir,
  overwrite: true,
  electronVersion: '44.2.0',
  asar: false,
  prune: false
});

console.log('desktop package created:');
for (const path of paths) console.log(`- ${path}`);
