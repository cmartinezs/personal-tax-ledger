import test from 'node:test';
import assert from 'node:assert/strict';
import { incomeSourceRequest, incomeSourceResponse } from '@personal-tax-ledger/api-contracts';

test('los DTOs de ingresos conservan la forma serializada compartida', () => {
  const request = incomeSourceRequest({ name: ' Trabajo ', kind: 'SALARY', amount: '2000000', inputMode: 'GROSS', frequency: 'MONTHLY', months: 12, taxYear: 2026 });
  assert.deepEqual(JSON.parse(JSON.stringify(request)), { name: 'Trabajo', kind: 'SALARY', amount: 2_000_000, inputMode: 'GROSS', frequency: 'MONTHLY', months: 12, taxYear: 2026 });
  const response = incomeSourceResponse({ ...request, id: '7', active: true, taxable: true });
  assert.equal(response.id, 7);
  assert.equal(response.amount, 2_000_000);
});
