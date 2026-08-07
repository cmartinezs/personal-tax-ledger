import test from 'node:test';
import assert from 'node:assert/strict';
import { createIncomeService } from '@personal-tax-ledger/frontend-application';

test('income-service delega cada operación en el cliente inyectado', async () => {
  const calls = [];
  const client = {
    listIncomes: async taxYear => { calls.push(['listIncomes', taxYear]); return [{ id: 1, name: 'Trabajo' }]; },
    createIncome: async source => { calls.push(['createIncome', source]); return { ...source, id: 2 }; },
    updateIncome: async source => { calls.push(['updateIncome', source]); return { ...source, name: `${source.name} actualizado` }; },
    deleteIncome: async id => { calls.push(['deleteIncome', id]); }
  };

  const service = createIncomeService(client);

  const listed = await service.list(2026);
  assert.deepEqual(listed, [{ id: 1, name: 'Trabajo' }]);

  const created = await service.create({ name: 'Nuevo ingreso' });
  assert.equal(created.id, 2);
  assert.equal(created.name, 'Nuevo ingreso');

  const updated = await service.update({ id: 2, name: 'Nuevo ingreso' });
  assert.equal(updated.name, 'Nuevo ingreso actualizado');

  await service.remove(2);

  assert.deepEqual(calls.map(call => call[0]), ['listIncomes', 'createIncome', 'updateIncome', 'deleteIncome']);
  assert.deepEqual(calls[0][1], 2026, 'list debe recibir el taxYear tal cual');
  assert.equal(calls[3][1], 2, 'remove debe recibir el id tal cual');
});
