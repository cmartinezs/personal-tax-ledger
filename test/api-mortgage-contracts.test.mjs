import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mortgageAnnualRecordFilters,
  mortgageAnnualRecordRequest,
  mortgageAnnualRecordResponse,
  mortgageLoanFilters,
  mortgageLoanRequest,
  mortgageLoanResponse
} from '@personal-tax-ledger/api-contracts';

test('los DTOs compartidos de mortgages y annual records normalizan transporte', () => {
  const loan = mortgageLoanRequest({ taxYear: '2026', institutionName: ' Banco ', propertyAlias: ' Casa ', ownershipPercentage: 3, purpose: 'INVALID', annualInterestPaid: '-1' });
  assert.equal(loan.taxYear, 2026);
  assert.equal(loan.institutionName, 'Banco');
  assert.equal(loan.ownershipPercentage, 1);
  assert.equal(loan.purpose, 'PURCHASE');
  assert.equal(loan.annualInterestPaid, 0);
  assert.equal(mortgageLoanResponse({ ...loan, id: 7 }).id, '7');
  assert.deepEqual(mortgageLoanFilters({ taxYear: '2026', institutionName: '' }), { taxYear: 2026, institutionName: undefined, propertyAlias: undefined });

  const record = mortgageAnnualRecordRequest({ taxYear: '2026', interestPaid: '-4', principalPaid: '500' });
  assert.equal(record.interestPaid, 0);
  assert.equal(record.principalPaid, 500);
  assert.equal(mortgageAnnualRecordResponse({ ...record, id: 8, mortgageLoanId: 7 }).mortgageLoanId, '7');
  assert.deepEqual(mortgageAnnualRecordFilters({ taxYear: '2026' }), { taxYear: 2026 });
});
