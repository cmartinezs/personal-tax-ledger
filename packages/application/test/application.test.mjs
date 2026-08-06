import test from 'node:test';
import assert from 'node:assert/strict';
import { createIncomeUseCases } from '../src/index.mjs';

test('application coordina casos de uso con repositorio inyectado', async () => {
  const context = { workspaceId: 'test', actorId: 'user' };
  const calls = [];
  const repository = {
    async list(receivedContext, year) { calls.push(['list', receivedContext, year]); return [{ id: 1 }]; },
    async get() { return null; },
    async create(receivedContext, input) { calls.push(['create', receivedContext, input]); return { ...input, id: 2 }; },
    async update() { return null; },
    async remove() { return true; },
    async copy() { return []; }
  };
  const useCases = createIncomeUseCases({ repository });
  assert.deepEqual(await useCases.listIncomeSources(context, 2026), [{ id: 1 }]);
  assert.equal((await useCases.createIncomeSource(context, { name: 'Trabajo' })).id, 2);
  assert.deepEqual(calls.map(call => call[0]), ['list', 'create']);
});
