import test from 'node:test';
import assert from 'node:assert/strict';
import { simulatePortfolio } from '../lib/calculator.mjs';
import { defaultSettings } from '../lib/defaults.mjs';

test('cada resultado anual relevante incluye trazabilidad consistente', () => {
  const result = simulatePortfolio([], defaultSettings, { annualAmount: 1_000_000, regime: 'B' });
  const byKey = new Map(result.explanations.map(item => [item.key, item]));
  assert.ok(result.explanations.length >= 8);
  assert.equal(byKey.get('tax.annual').result.value, result.totals.annualTax);
  assert.equal(byKey.get('balance.estimated').result.value, result.totals.estimatedBalance);
  assert.equal(byKey.get('mortgage.deduction').result.value, result.totals.mortgageDeduction);
  assert.equal(byKey.get('apv.regime-a').result.value, result.totals.apvABonus);
  assert.equal(byKey.get('apv.regime-b').result.value, result.totals.directApvContribution);
});

test('la explicación hipotecaria distingue intereses de la rebaja tributaria', () => {
  const result = simulatePortfolio([], defaultSettings, { annualAmount: 0, regime: 'NONE' }, {
    mortgages: [{ id: 'm1', propertyAlias: 'Casa', eligibleForArticle55Bis: true, annualInterestPaid: 4_000_000, annualPrincipalPaid: 20_000_000, annualInsurancePaid: 300_000, annualOtherCharges: 100_000 }],
    annualRecords: []
  });
  const explanation = result.explanations.find(item => item.key === 'mortgage.deduction');
  assert.equal(explanation.result.value, result.totals.mortgageDeduction);
  assert.match(explanation.shortDescription, /intereses/);
  assert.match(explanation.assumptions[0], /seguros/);
});
