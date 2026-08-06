import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalComposition } from '@personal-tax-ledger/local-app';

test('la composición local fija el contexto y ensambla el agregado de ingresos', () => {
  const repository = { list() { return []; }, get() { return null; }, create() { return null; }, update() { return null; }, remove() { return false; } };
  const composition = createLocalComposition({ incomeRepository: repository });
  assert.deepEqual(composition.context, { workspaceId: 'local-workspace', actorId: 'local-user' });
  assert.equal(composition.incomeRepository, repository);
  assert.equal(typeof composition.incomeUseCases.listIncomeSources, 'function');
  assert.equal(typeof composition.createIncomeRouter, 'function');
});
