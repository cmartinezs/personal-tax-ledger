import test from 'node:test';
import assert from 'node:assert/strict';
import { executionLogFilters, executionLogPageResponse, executionLogRequest, scenariosResponse, snapshotRequest } from '@personal-tax-ledger/api-contracts';

test('los DTOs compartidos de snapshots, escenarios, años y logs estabilizan sus formas', () => {
  assert.deepEqual(snapshotRequest({ name: '', payload: null }), { name: 'Simulación', payload: {} });
  assert.equal(scenariosResponse([{ key: 1, label: null, diff: '4' }])[0].diff, 4);
  assert.deepEqual(executionLogRequest({ kind: 'BAD', operation: 2, status: 'BAD', durationMs: -1 }), { kind: 'SYNC', operation: '2', status: 'OK', message: null, auditMessage: null, durationMs: 0 });
  assert.deepEqual(executionLogFilters({ page: '2', pageSize: '50' }), { kind: undefined, status: undefined, operation: undefined, q: undefined, page: 2, pageSize: 50 });
  assert.deepEqual(executionLogPageResponse({ items: null, total: '3', page: '2', pageSize: '5' }), { items: [], total: 3, page: 2, pageSize: 5 });
});
