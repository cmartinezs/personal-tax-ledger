import { existsSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
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

const localBin = join(repoRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'electron-packager.cmd' : 'electron-packager');
if (!existsSync(localBin)) {
  throw new Error(`No se encontró @electron/packager local en ${localBin}. Ejecuta npm install antes de empaquetar.`);
}

const args = [
  dir,
  'Personal Tax Ledger',
  `--platform=${platform}`,
  `--arch=${arch}`,
  `--out=${outDir}`,
  '--overwrite',
  '--electron-version=44.2.0',
  '--executable-name=PersonalTaxLedger',
  '--no-prune',
  '--no-asar'
];

const result = spawnSync(localBin, args, {
  cwd: repoRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

if (result.error) throw result.error;
if (result.status !== 0) {
  throw new Error(`electron-packager terminó con código ${result.status ?? 'desconocido'}`);
}

console.log(`desktop package created under: ${outDir}`);
