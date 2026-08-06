import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createLocalComposition } from '@personal-tax-ledger/local-app';

test('la composición local fija el contexto y ensambla el agregado de ingresos', () => {
  const repository = { list() { return []; }, get() { return null; }, create() { return null; }, update() { return null; }, remove() { return false; }, copy() { return null; } };
  const composition = createLocalComposition({ incomeRepository: repository });
  assert.deepEqual(composition.context, { workspaceId: 'local-workspace', actorId: 'local-user' });
  assert.equal(composition.incomeRepository, repository);
  assert.equal(typeof composition.incomeUseCases.listIncomeSources, 'function');
  assert.equal(typeof composition.createIncomeRouter, 'function');
});

test('server/index.mjs usa el composition root local en vez de reensamblar sus propias dependencias', async () => {
  const source = await readFile('server/index.mjs', 'utf8');
  assert.match(source, /import\s*\{\s*createLocalComposition\s*\}\s*from\s*'@personal-tax-ledger\/local-app'/);
  assert.match(source, /createLocalComposition\(\)/);
  assert.match(source, /localComposition\.createIncomeRouter\(/);
  assert.doesNotMatch(source, /createIncomeUseCases\(/);
  assert.doesNotMatch(source, /sqliteIncomeRepository/);
});

test('importar local-app o sqlite-adapter no abre ni migra la base SQLite real', () => {
  // Se ejecuta en un subproceso aislado (con su propio grafo de módulos y
  // DB_PATH) porque este archivo ya importó '@personal-tax-ledger/local-app'
  // de forma estática arriba; reimportarlo en el mismo proceso solo
  // devolvería el módulo ya cacheado, sin volver a evaluar su cuerpo.
  const directory = mkdtempSync(join(tmpdir(), 'personal-tax-ledger-a11-'));
  const dbPath = join(directory, 'should-not-exist.sqlite');
  const script = `
    await import('@personal-tax-ledger/local-app');
    await import('@personal-tax-ledger/sqlite-adapter');
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: process.cwd(),
    env: { ...process.env, DB_PATH: dbPath },
    encoding: 'utf8'
  });
  const dbWasCreated = existsSync(dbPath);
  rmSync(directory, { recursive: true, force: true });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(dbWasCreated, false, 'importar los paquetes no debe crear ni migrar el archivo SQLite');
});
