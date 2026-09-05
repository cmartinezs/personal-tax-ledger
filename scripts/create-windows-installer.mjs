import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
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
const winstallerRoot = dirname(require.resolve('electron-winstaller/package.json'));
const winstallerVendor = join(winstallerRoot, 'vendor');

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
  setupExe: 'PersonalTaxLedger-Setup.exe',
  noMsi: true,
  noDelta: true
});

console.log(`windows installer created: ${join(outputDirectory, 'PersonalTaxLedger-Setup.exe')}`);
console.log('Squirrel metadata generated in the same directory for later update-channel work.');
