import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createLocalComposition } from '@personal-tax-ledger/local-app';

test('la composición local fija el contexto y ensambla el agregado de ingresos', () => {
  const repository = { list() { return []; }, get() { return null; }, create() { return null; }, update() { return null; }, remove() { return false; } };
  const composition = createLocalComposition({ incomeRepository: repository });
  assert.deepEqual(composition.context, { workspaceId: 'local-workspace', actorId: 'local-user' });
  assert.equal(composition.incomeRepository, repository);
  assert.equal(typeof composition.incomeUseCases.listIncomeSources, 'function');
  assert.equal(typeof composition.createIncomeRouter, 'function');
});

test('server/index.mjs usa el composition root local en vez de reensamblar sus propias dependencias', async () => {
  const source = await readFile('server/index.mjs', 'utf8');
  assert.match(source, /import\s*\{\s*localComposition\s*\}\s*from\s*'@personal-tax-ledger\/local-app'/);
  assert.match(source, /localComposition\.createIncomeRouter\(/);
  assert.doesNotMatch(source, /createIncomeUseCases\(/);
  assert.doesNotMatch(source, /sqliteIncomeRepository/);
});
