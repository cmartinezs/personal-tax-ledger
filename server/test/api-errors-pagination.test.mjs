import test from 'node:test';
import assert from 'node:assert/strict';
import { apiErrorResponse, pagination } from '@personal-tax-ledger/api-contracts';

test('los contratos compartidos de errores y paginación normalizan metadatos HTTP', () => {
  assert.deepEqual(apiErrorResponse({ code: 'invalid', message: 'No', fieldErrors: { name: 'required' } }), { code: 'invalid', message: 'No', fieldErrors: { name: 'required' } });
  assert.deepEqual(pagination({ page: 0, pageSize: 500, total: '-1' }), { page: 1, pageSize: 200, total: 0 });
});
