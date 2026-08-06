import test from 'node:test';
import assert from 'node:assert/strict';
import { createIncomeUseCases } from '@personal-tax-ledger/application';

test('el caso de uso de ingresos coordina contexto y repositorio sin conocer infraestructura', () => {
  const calls = [];
  const repository = {
    list: (context, year) => { calls.push(['list', context, year]); return [{ id: 1 }]; },
    get: (context, id) => { calls.push(['get', context, id]); return { id }; },
    create: (context, input) => { calls.push(['create', context, input]); return { id: 2, ...input }; },
    update: (context, id, input) => { calls.push(['update', context, id, input]); return { id, ...input }; },
    remove: (context, id) => { calls.push(['remove', context, id]); return true; }
  };
  const context = { workspaceId: 'local-workspace', actorId: 'local-user' };
  const useCases = createIncomeUseCases({ repository });
  assert.deepEqual(useCases.listIncomeSources(context, 2026), [{ id: 1 }]);
  assert.equal(useCases.getIncomeSource(context, 1).id, 1);
  assert.equal(useCases.createIncomeSource(context, { name: 'x' }).id, 2);
  assert.equal(useCases.updateIncomeSource(context, 1, { name: 'y' }).id, 1);
  assert.equal(useCases.deleteIncomeSource(context, 1), true);
  assert.equal(calls.length, 5);
  assert.throws(() => useCases.listIncomeSources({ workspaceId: 'x' }), /actorId/);
});
