import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { createWindowsInstaller } = require('electron-winstaller');

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
const appDirectory = join(repoRoot, 'out', 'Personal Tax Ledger-win32-x64');
const outputDirectory = join(repoRoot, 'out', 'installer-win32-x64');
const installerAssetsDirectory = join(repoRoot, 'out', '.installer-assets');
const loadingGifPath = join(installerAssetsDirectory, 'ptl-loading.gif');
const setupFileName = `PersonalTaxLedger-${packageJson.version}-Setup.exe`;
const winstallerRoot = dirname(require.resolve('electron-winstaller/package.json'));
const winstallerVendor = join(winstallerRoot, 'vendor');

// Small PTL-branded animated GIF used by Squirrel while the installer/update is applying.
// Keeping it embedded makes the installer build deterministic and avoids a binary source asset.
const PTL_LOADING_GIF_BASE64 = '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';

function commandAvailable(command) {
  const result = spawnSync('sh', ['-lc', `command -v ${command}`], { stdio: 'ignore' });
  return result.status === 0;
}

function materializeSquirrel7Zip() {
  const hostArch = os.arch();
  const supported = new Set(['x64', 'arm64']);
  if (!supported.has(hostArch)) {
    throw new Error(`Arquitectura host no soportada para 7-Zip de electron-winstaller: ${hostArch}.`);
  }

  const sourceExe = join(winstallerVendor, `7z-${hostArch}.exe`);
  const sourceDll = join(winstallerVendor, `7z-${hostArch}.dll`);
  const targetExe = join(winstallerVendor, '7z.exe');
  const targetDll = join(winstallerVendor, '7z.dll');

  for (const source of [sourceExe, sourceDll]) {
    if (!existsSync(source)) {
      throw new Error(`electron-winstaller no contiene el binario 7-Zip esperado: ${source}`);
    }
  }

  copyFileSync(sourceExe, targetExe);
  copyFileSync(sourceDll, targetDll);

  if (!existsSync(targetExe) || !existsSync(targetDll)) {
    throw new Error('No fue posible materializar vendor/7z.exe y vendor/7z.dll para Squirrel.Windows.');
  }

  console.log(`Squirrel 7-Zip materialized for host arch ${hostArch}:`);
  console.log(`- ${targetExe}`);
  console.log(`- ${targetDll}`);
}

function materializeInstallerAssets() {
  mkdirSync(installerAssetsDirectory, { recursive: true });
  writeFileSync(loadingGifPath, Buffer.from(PTL_LOADING_GIF_BASE64, 'base64'));
  if (!existsSync(loadingGifPath)) {
    throw new Error('No fue posible materializar el splash de instalación PTL.');
  }
  console.log(`PTL installer loading GIF materialized: ${loadingGifPath}`);
}

if (process.platform !== 'win32') {
  const missing = ['mono', 'wine'].filter(command => !commandAvailable(command));
  if (missing.length > 0) {
    throw new Error(`Generar el instalador Squirrel desde Linux/WSL requiere Mono y Wine. Faltan: ${missing.join(', ')}.`);
  }
}

if (!existsSync(join(appDirectory, 'PersonalTaxLedger.exe'))) {
  throw new Error(`No existe el paquete Windows esperado en ${appDirectory}. Ejecuta npm run desktop:package:win antes de generar el instalador.`);
}

materializeSquirrel7Zip();
rmSync(outputDirectory, { recursive: true, force: true });
materializeInstallerAssets();

await createWindowsInstaller({
  appDirectory,
  outputDirectory,
  usePackageJson: false,
  name: 'PersonalTaxLedger',
  title: 'Personal Tax Ledger',
  description: 'Personal tax ledger and estimation desktop application',
  authors: 'Personal Tax Ledger',
  owners: 'Personal Tax Ledger',
  version: packageJson.version,
  exe: 'PersonalTaxLedger.exe',
  setupExe: setupFileName,
  loadingGif: loadingGifPath,
  noMsi: true,
  noDelta: true
});

console.log(`windows installer created: ${join(outputDirectory, setupFileName)}`);
console.log('Squirrel metadata generated in the same directory for later update-channel work.');
