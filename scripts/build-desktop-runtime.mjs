import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const stagingRoot = join(repoRoot, '.desktop-runtime');

const runtimePackages = [
  'api-contracts',
  'application',
  'contracts',
  'core',
  'http-api',
  'sqlite-adapter'
];

function copyDirectory(source, target) {
  if (!existsSync(source)) throw new Error(`No existe el recurso requerido para desktop runtime: ${source}`);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true, dereference: true });
}

function copyFile(source, target) {
  if (!existsSync(source)) throw new Error(`No existe el archivo requerido para desktop runtime: ${source}`);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target);
}

function writeRuntimePackageJson() {
  const rootPackage = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
  const runtimePackage = {
    name: rootPackage.name,
    productName: rootPackage.productName,
    version: rootPackage.version,
    private: true,
    type: 'module',
    main: 'apps/desktop/main.mjs'
  };
  writeFileSync(join(stagingRoot, 'package.json'), `${JSON.stringify(runtimePackage, null, 2)}\n`);
}

function materializeRuntimePackage(packageDir) {
  const sourceRoot = join(repoRoot, 'packages', packageDir);
  const targetRoot = join(stagingRoot, 'node_modules', '@personal-tax-ledger', packageDir);
  const packageJsonPath = join(sourceRoot, 'package.json');

  if (!existsSync(packageJsonPath)) {
    throw new Error(`No existe package.json para @personal-tax-ledger/${packageDir}`);
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  mkdirSync(targetRoot, { recursive: true });
  copyFile(packageJsonPath, join(targetRoot, 'package.json'));

  const runtimeEntries = Array.isArray(packageJson.files) && packageJson.files.length > 0
    ? packageJson.files
    : ['src'];

  for (const entry of runtimeEntries) {
    const source = join(sourceRoot, entry);
    const target = join(targetRoot, entry);
    if (!existsSync(source)) continue;
    if (lstatSync(source).isDirectory()) copyDirectory(source, target);
    else copyFile(source, target);
  }
}

function verifyMaterializedPackages() {
  for (const packageDir of runtimePackages) {
    const target = join(stagingRoot, 'node_modules', '@personal-tax-ledger', packageDir);
    if (!existsSync(join(target, 'package.json'))) {
      throw new Error(`Paquete interno no materializado: @personal-tax-ledger/${packageDir}`);
    }
    if (lstatSync(target).isSymbolicLink()) {
      throw new Error(`El staging desktop no puede contener symlinks de workspace: ${target}`);
    }
    if (existsSync(join(target, 'test'))) {
      throw new Error(`El staging desktop no debe contener tests: ${target}`);
    }
  }
}

export function buildDesktopRuntime() {
  rmSync(stagingRoot, { recursive: true, force: true });
  mkdirSync(stagingRoot, { recursive: true });

  writeRuntimePackageJson();

  copyFile(join(repoRoot, 'apps', 'desktop', 'main.mjs'), join(stagingRoot, 'apps', 'desktop', 'main.mjs'));
  copyFile(join(repoRoot, 'apps', 'desktop', 'preload.cjs'), join(stagingRoot, 'apps', 'desktop', 'preload.cjs'));
  copyFile(join(repoRoot, 'apps', 'desktop', 'bootstrap-config.mjs'), join(stagingRoot, 'apps', 'desktop', 'bootstrap-config.mjs'));
  copyDirectory(join(repoRoot, 'apps', 'local', 'src'), join(stagingRoot, 'apps', 'local', 'src'));
  copyDirectory(join(repoRoot, 'apps', 'local', 'web', 'dist'), join(stagingRoot, 'apps', 'local', 'web', 'dist'));

  for (const packageDir of runtimePackages) materializeRuntimePackage(packageDir);

  verifyMaterializedPackages();
  console.log(`desktop runtime staged: ${stagingRoot}`);
  console.log(`materialized packages: ${runtimePackages.map(name => `@personal-tax-ledger/${name}`).join(', ')}`);
  return stagingRoot;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildDesktopRuntime();
}
