import test from 'node:test';
import assert from 'node:assert/strict';
import { packageName, simulatePortfolio, computeFeeReceiptAmounts, computeArticle55BisBenefit } from '@personal-tax-ledger/core';
import { defaultSettings } from '@personal-tax-ledger/core/defaults';

test('los cálculos puros se resuelven desde core', () => {
  assert.equal(packageName, '@personal-tax-ledger/core');
  const simulation = simulatePortfolio([], defaultSettings);
  assert.equal(simulation.totals.annualTax, 0);
  assert.equal(computeFeeReceiptAmounts({ amountInputType: 'GROSS', grossAmount: 1_000_000, withholdingMode: 'WITHHELD_BY_RECIPIENT', withholdingRate: 0.1525 }, { fee_withholding_rate: 0.1525 }).withheldAmount, 152_500);
  assert.equal(computeArticle55BisBenefit([], [], { incomeEstimate: 0, utaValue: 1 }, {}).deduction, 0);
});
