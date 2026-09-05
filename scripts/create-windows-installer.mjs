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
