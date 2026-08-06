import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCAL_WORKSPACE_CONTEXT, INCOME_REPOSITORY_METHODS, assertIncomeRepositoryContract, assertWorkspaceContext } from '../src/index.mjs';

test('contracts valida contexto y contratos de repositorio', () => {
  assert.deepEqual(assertWorkspaceContext(LOCAL_WORKSPACE_CONTEXT), LOCAL_WORKSPACE_CONTEXT);
  const repository = Object.fromEntries(INCOME_REPOSITORY_METHODS.map(method => [method, () => {}]));
  assert.equal(assertIncomeRepositoryContract(repository), repository);
  assert.throws(() => assertWorkspaceContext({ workspaceId: 'missing-actor' }), /actorId/);
  assert.throws(() => assertIncomeRepositoryContract({ list() {} }), /get/);
});
