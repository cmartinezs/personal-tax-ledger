import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { createWindowsInstaller } = require('electron-winstaller');

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
const appDirectory = join(repoRoot, 'out', 'Personal Tax Ledger-win32-x64');
const outputDirectory = join(repoRoot, 'out', 'installer-win32-x64');

function commandAvailable(command) {
  const result = spawnSync('sh', ['-lc', `command -v ${command}`], { stdio: 'ignore' });
  return result.status === 0;
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
