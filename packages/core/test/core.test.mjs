import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultSettings, packageName, simulatePortfolio, computeFeeReceiptAmounts, computeArticle55BisBenefit } from '../src/index.mjs';

test('core expone API pública y cálculos puros', () => {
  assert.equal(packageName, '@personal-tax-ledger/core');
  const simulation = simulatePortfolio([], defaultSettings);
  assert.equal(simulation.totals.annualTax, 0);
  assert.equal(computeFeeReceiptAmounts({ amountInputType: 'GROSS', grossAmount: 1_000_000, withholdingMode: 'WITHHELD_BY_RECIPIENT', withholdingRate: 0.1525 }, { fee_withholding_rate: 0.1525 }).withheldAmount, 152_500);
  assert.equal(computeArticle55BisBenefit([{ id: 'loan', propertyAlias: 'Casa', eligibleForArticle55Bis: true, annualInterestPaid: 4_000_000 }], [], { incomeEstimate: 30_000_000, utaValue: 1_000_000 }, {}).deduction, 4_000_000);
});
