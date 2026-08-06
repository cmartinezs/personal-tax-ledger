import test from 'node:test';
import assert from 'node:assert/strict';
import { compareApv, grossFromTargetNet, monthlySalaryFromGross, simulatePortfolio, taxFromTaxableIncome } from '../lib/calculator.mjs';
import { defaultSettings } from '../lib/defaults.mjs';

const settings = { ...defaultSettings, ufValue: 40844.79, utmValue: 71649 };

test('IUSC is exempt up to 13.5 UTM', () => {
  assert.equal(taxFromTaxableIncome(13.5 * settings.utmValue, settings.utmValue), 0);
});

test('salary net is lower than gross and includes mandatory contributions', () => {
  const result = monthlySalaryFromGross({ amount: 4_000_000, afpName: 'UNO', healthSystem: 'FONASA', contractType: 'INDEFINITE', apvRegime: 'NONE' }, settings);
  assert.ok(result.net < result.gross);
  assert.ok(result.pension > 0);
  assert.ok(result.taxWithheld > 0);
});

test('gross can be estimated from target net', () => {
  const source = { amount: 3_500_000, inputMode: 'NET', afpName: 'UNO', healthSystem: 'FONASA', contractType: 'INDEFINITE', apvRegime: 'NONE' };
  const gross = grossFromTargetNet(source, settings);
  const result = monthlySalaryFromGross({ ...source, amount: gross, inputMode: 'GROSS' }, settings);
  assert.ok(Math.abs(result.net - 3_500_000) < 2);
});

test('two employers can generate annual tax balance despite monthly withholding', () => {
  const sources = [
    { id: 1, active: true, name: 'Trabajo A', kind: 'SALARY', inputMode: 'NET', amount: 3_500_000, months: 12, afpName: 'UNO', healthSystem: 'FONASA', contractType: 'INDEFINITE', apvRegime: 'NONE' },
    { id: 2, active: true, name: 'Trabajo B', kind: 'SALARY', inputMode: 'NET', amount: 1_200_000, months: 12, afpName: 'UNO', healthSystem: 'FONASA', contractType: 'INDEFINITE', apvRegime: 'NONE' }
  ];
  const result = simulatePortfolio(sources, settings);
  assert.ok(result.totals.estimatedBalance > 0);
});

test('APV B reduces tax while APV A produces fiscal bonus', () => {
  const sources = [{ active: true, name: 'Trabajo', kind: 'SALARY', inputMode: 'GROSS', amount: 6_000_000, months: 12, afpName: 'UNO', healthSystem: 'FONASA', contractType: 'INDEFINITE', apvRegime: 'NONE' }];
  const comparison = compareApv(sources, settings, 3_000_000);
  assert.ok(comparison.regimeB.incrementalBenefit > 0);
  assert.ok(comparison.regimeA.incrementalBenefit > 0);
});
