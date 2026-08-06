import test from 'node:test';
import assert from 'node:assert/strict';
import { assertIncomeRepositoryContract, assertSettingsRepositoryContract, assertWorkspaceContext, INCOME_REPOSITORY_METHODS, SETTINGS_REPOSITORY_METHODS, LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';

test('el contexto local cumple el contrato de propietario', () => {
  assert.deepEqual(assertWorkspaceContext(LOCAL_WORKSPACE_CONTEXT), { workspaceId: 'local-workspace', actorId: 'local-user' });
  assert.throws(() => assertWorkspaceContext({ workspaceId: 'local-workspace' }), /actorId/);
});

test('el contrato de repositorio de ingresos exige métodos por agregado', () => {
  const repository = Object.fromEntries(INCOME_REPOSITORY_METHODS.map(method => [method, () => null]));
  assert.equal(assertIncomeRepositoryContract(repository), repository);
  assert.throws(() => assertIncomeRepositoryContract({ list() {} }), /get/);
});

test('el contrato de repositorio de settings exige get/update, no reutiliza el de ingresos', () => {
  const repository = Object.fromEntries(SETTINGS_REPOSITORY_METHODS.map(method => [method, () => null]));
  assert.equal(assertSettingsRepositoryContract(repository), repository);
  assert.throws(() => assertSettingsRepositoryContract({ get() {} }), /update/);
  assert.throws(() => assertIncomeRepositoryContract(repository), /list/, 'el contrato de settings no debe satisfacer el de ingresos');
});
