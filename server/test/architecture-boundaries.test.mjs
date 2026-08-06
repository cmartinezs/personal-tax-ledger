import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

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
