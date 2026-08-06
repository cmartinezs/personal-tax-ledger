import test from 'node:test';
import assert from 'node:assert/strict';
import {
  feeExpenseSettingsRequest,
  feeReceiptFilters,
  feeReceiptRequest,
  feeReceiptResponse
} from '@personal-tax-ledger/api-contracts';

test('los DTOs compartidos de boletas y gastos normalizan transporte sin depender de web', () => {
  const receipt = feeReceiptRequest({ taxYear: '2026', clientName: '  Cliente ', grossAmount: '-2', withholdingMode: 'INVALID' });
  assert.equal(receipt.taxYear, 2026);
  assert.equal(receipt.clientName, 'Cliente');
  assert.equal(receipt.grossAmount, 0);
  assert.equal(receipt.withholdingMode, 'WITHHELD_BY_RECIPIENT');
  assert.equal(feeReceiptResponse({ ...receipt, id: 42 }).id, '42');
  assert.deepEqual(feeReceiptFilters({ taxYear: '2026', status: '' }), { taxYear: 2026, clientName: undefined, status: undefined, paymentStatus: undefined, withholdingMode: undefined });
  assert.deepEqual(feeExpenseSettingsRequest({ taxYear: '2026', expenseMode: 'ACTUAL', actualAnnualExpenses: '-1' }), { taxYear: 2026, expenseMode: 'ACTUAL', actualAnnualExpenses: 0, notes: null });
});
