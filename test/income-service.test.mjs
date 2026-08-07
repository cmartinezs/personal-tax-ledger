import test from 'node:test';
import assert from 'node:assert/strict';
import { createIncomeService } from '../web/src/income-service.ts';

test('income-service delega cada operación en el cliente inyectado', async () => {
  const calls = [];
  const client = {
    list: async taxYear => { calls.push(['list', taxYear]); return [{ id: 1, name: 'Trabajo' }]; },
    create: async source => { calls.push(['create', source]); return { ...source, id: 2 }; },
    update: async source => { calls.push(['update', source]); return { ...source, name: `${source.name} actualizado` }; },
    remove: async id => { calls.push(['remove', id]); }
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

  assert.deepEqual(calls.map(call => call[0]), ['list', 'create', 'update', 'remove']);
  assert.deepEqual(calls[0][1], 2026, 'list debe recibir el taxYear tal cual');
  assert.equal(calls[3][1], 2, 'remove debe recibir el id tal cual');
});
