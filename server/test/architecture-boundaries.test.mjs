import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { runArchitectureCheck } from '../../scripts/architecture-check.mjs';

const forbiddenImport = /(?:import\s+(?:[^'";]+\s+from\s+)?|export\s+[^'";]+\s+from\s+|require\s*\()(['"])([^'"]+)\1/g;
const forbidden = /^(?:node:sqlite|node:http|react|react-dom|supabase|firebase)(?:\/|$)/i;

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else if (/\.(?:mjs|js|ts|tsx)$/.test(entry.name)) files.push(path);
  }
  return files;
}

test('core no depende de infraestructura o frameworks de aplicación', async () => {
  const files = await listFiles(resolve('packages/core'));
  for (const file of files) {
    const content = await readFile(file, 'utf8');
    for (const match of content.matchAll(forbiddenImport)) {
      assert.doesNotMatch(match[2], forbidden, `Import prohibido en ${file}: ${match[2]}`);
    }
  }
});

test('los paquetes internos tienen exports explícitos', async () => {
  for (const name of ['core', 'contracts', 'api-contracts']) {
    const packageJson = JSON.parse(await readFile(resolve(`packages/${name}/package.json`), 'utf8'));
    assert.equal(packageJson.private, true);
    assert.ok(packageJson.exports['.']);
  }
});

test('no hay ciclos de dependencias entre paquetes internos y core/contracts no dependen de infraestructura', async () => {
  const { packageCount, graph } = await runArchitectureCheck();
  assert.ok(packageCount >= 6);
  assert.deepEqual([...graph.get('@personal-tax-ledger/core')], []);
  assert.deepEqual([...graph.get('@personal-tax-ledger/contracts')], []);
});

test('application no depende de sqlite-adapter ni de adapters concretos', async () => {
  const { graph } = await runArchitectureCheck();
  const application = graph.get('@personal-tax-ledger/application');
  assert.ok(application);
  assert.ok(!application.has('@personal-tax-ledger/sqlite-adapter'), 'application no puede conocer sqlite-adapter');
  assert.ok(!application.has('@personal-tax-ledger/shared-ui'));
});

test('shared-ui no importa web, server ni apps/local', async () => {
  const files = await listFiles(resolve('packages/shared-ui/src'));
  for (const file of files) {
    const content = await readFile(file, 'utf8');
    for (const match of content.matchAll(forbiddenImport)) {
      assert.doesNotMatch(match[2], /^(?:\.\.\/)*(?:web|server|apps\/local)(?:\/|$)/, `shared-ui no puede importar roots legacy en ${file}: ${match[2]}`);
    }
  }
});

test('los packages reusables no importan roots legacy salvo excepciones transitorias registradas', async () => {
  const files = (await listFiles(resolve('packages'))).filter(file => !file.includes('shared-ui/dist'));
  for (const file of files) {
    const content = await readFile(file, 'utf8');
    for (const match of content.matchAll(forbiddenImport)) {
      assert.doesNotMatch(match[2], /^(?:\.\.\/)*(?:server|web)(?:\/|$)/, `Package reusable importa root legacy en ${file}: ${match[2]}`);
    }
  }
});

test('una dependencia legacy nueva en application es rechazada por el checker', async () => {
  const packageJsonPath = resolve('packages/application/package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  assert.ok(!packageJson.dependencies['@personal-tax-ledger/sqlite-adapter'], 'application no debe declarar sqlite-adapter');
});
