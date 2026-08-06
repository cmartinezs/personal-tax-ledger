import test from 'node:test';
import assert from 'node:assert/strict';
import { assertRepositoryContract, assertWorkspaceContext, INCOME_REPOSITORY_METHODS, LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';

test('el contexto local cumple el contrato de propietario', () => {
  assert.deepEqual(assertWorkspaceContext(LOCAL_WORKSPACE_CONTEXT), { workspaceId: 'local-workspace', actorId: 'local-user' });
  assert.throws(() => assertWorkspaceContext({ workspaceId: 'local-workspace' }), /actorId/);
});

test('el contrato de repositorio de ingresos exige métodos por agregado', () => {
  const repository = Object.fromEntries(INCOME_REPOSITORY_METHODS.map(method => [method, () => null]));
  assert.equal(assertRepositoryContract(repository), repository);
  assert.throws(() => assertRepositoryContract({ list() {} }), /get/);
});
