import test from 'node:test';
import assert from 'node:assert/strict';
import { feeReceiptRequest, incomeSourceRequest, mortgageLoanRequest, pagination } from '../src/index.mjs';

test('api-contracts normaliza DTOs públicos sin infraestructura', () => {
  assert.equal(incomeSourceRequest({ name: ' Test ', amount: '10', taxYear: '2026' }).name, 'Test');
  assert.equal(feeReceiptRequest({ clientName: ' Cliente ' }).clientName, 'Cliente');
  assert.equal(mortgageLoanRequest({ propertyAlias: ' Casa ' }).propertyAlias, 'Casa');
  assert.deepEqual(pagination({ page: 2, pageSize: 10, total: 20 }), { page: 2, pageSize: 10, total: 20 });
});
