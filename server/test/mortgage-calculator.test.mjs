import test from 'node:test';
import assert from 'node:assert/strict';
import { computeArticle55BisBenefit } from '../lib/mortgage-calculator.mjs';
import { simulatePortfolio } from '../lib/calculator.mjs';
import { defaultSettings } from '../lib/defaults.mjs';
import { TAX_PARAMETER_KEYS } from '../lib/tax-parameters.mjs';

const uta = defaultSettings.utmValue * 12;
const params = {
  [TAX_PARAMETER_KEYS.MORTGAGE_INTEREST_MAX_UTA]: 8,
  [TAX_PARAMETER_KEYS.MORTGAGE_FULL_BENEFIT_INCOME_MAX_UTA]: 90,
  [TAX_PARAMETER_KEYS.MORTGAGE_PARTIAL_BENEFIT_INCOME_MAX_UTA]: 150,
  [TAX_PARAMETER_KEYS.MORTGAGE_PARTIAL_FORMULA_CONSTANT]: 250,
  [TAX_PARAMETER_KEYS.MORTGAGE_PARTIAL_FORMULA_FACTOR]: 1.667
};

function loan(overrides = {}) {
  return {
    id: 'x',
    eligibleForArticle55Bis: true,
    ownershipType: 'SOLE_OWNER',
    ownershipPercentage: 1,
    isDesignatedBeneficiary: true,
    propertyAlias: 'A',
    purpose: 'PURCHASE',
    ...overrides
  };
}

function records(interest, loanId = 'x') {
  return [{ mortgageLoanId: loanId, interestPaid: interest, principalPaid: 0, insurancePaid: 0, otherCharges: 0 }];
}

test('1. Renta menor a 90 UTA', () => {
  const r = computeArticle55BisBenefit([loan()], records(5_000_000), { incomeEstimate: 30 * uta, utaValue: uta }, params);
  assert.equal(r.bracket, 'FULL');
  assert.equal(r.applicablePercentage, 100);
  assert.equal(r.deduction, 5_000_000);
});

test('2. Renta exactamente igual a 90 UTA', () => {
  const r = computeArticle55BisBenefit([loan()], records(5_000_000), { incomeEstimate: 90 * uta, utaValue: uta }, params);
  assert.equal(r.bracket, 'PARTIAL');
  // Fórmula: 250 - 1.667 * 90 = 99.97 → clamp(0,100) = 99.97
  assert.ok(r.applicablePercentage <= 100 && r.applicablePercentage > 99);
  assert.equal(r.deduction, Math.round(5_000_000 * r.applicablePercentage / 100));
});

test('3. Renta entre 90 y 150 UTA', () => {
  const r = computeArticle55BisBenefit([loan()], records(5_000_000), { incomeEstimate: 100 * uta, utaValue: uta }, params);
  assert.equal(r.bracket, 'PARTIAL');
  // 250 - 1.667 * 100 = 83.30
  assert.ok(Math.abs(r.applicablePercentage - 83.30) < 0.05);
});

test('4. Renta exactamente igual a 150 UTA', () => {
  const r = computeArticle55BisBenefit([loan()], records(5_000_000), { incomeEstimate: 150 * uta, utaValue: uta }, params);
  assert.equal(r.bracket, 'PARTIAL');
  // 250 - 1.667*150 = 0
  assert.equal(r.applicablePercentage, 0);
  assert.equal(r.deduction, 0);
});

test('5. Renta superior a 150 UTA', () => {
  const r = computeArticle55BisBenefit([loan()], records(5_000_000), { incomeEstimate: 200 * uta, utaValue: uta }, params);
  assert.equal(r.bracket, 'EXCLUDED');
  assert.equal(r.applicablePercentage, 0);
  assert.equal(r.deduction, 0);
});

test('6. Intereses menores a 8 UTA', () => {
  const interest = 4_000_000;
  const r = computeArticle55BisBenefit([loan()], records(interest), { incomeEstimate: 30 * uta, utaValue: uta }, params);
  assert.equal(r.baseDeductibleInterest, interest);
  assert.equal(r.capInterest, 8 * uta);
  assert.equal(r.deduction, interest);
});

test('7. Intereses superiores a 8 UTA', () => {
  const interest = 100_000_000;
  const r = computeArticle55BisBenefit([loan()], records(interest), { incomeEstimate: 30 * uta, utaValue: uta }, params);
  assert.equal(r.baseDeductibleInterest, 8 * uta);
  assert.equal(r.rejectedInterestOverCap, interest - 8 * uta);
  assert.equal(r.deduction, 8 * uta);
});

test('8. Dos créditos cuyos intereses se acumulan', () => {
  // Usamos intereses cuyo total (3M + 2M = 5M) está por debajo del tope de 8 UTA (6.878.304)
  // para verificar que efectivamente se suman sin truncamiento.
  const r = computeArticle55BisBenefit(
    [loan({ id: 'a' }), loan({ id: 'b', propertyAlias: 'B' })],
    [{ mortgageLoanId: 'a', interestPaid: 3_000_000 }, { mortgageLoanId: 'b', interestPaid: 2_000_000 }],
    { incomeEstimate: 30 * uta, utaValue: uta }, params
  );
  assert.equal(r.totalInterestPaid, 5_000_000);
  assert.equal(r.eligibleInterest, 5_000_000);
  assert.equal(r.baseDeductibleInterest, 5_000_000);
  assert.equal(r.deduction, 5_000_000);
});

test('9. Crédito no elegible', () => {
  const r = computeArticle55BisBenefit([loan({ eligibleForArticle55Bis: false })], records(5_000_000), { incomeEstimate: 30 * uta, utaValue: uta }, params);
  assert.equal(r.eligibleInterest, 0);
  assert.equal(r.baseDeductibleInterest, 0);
  assert.equal(r.deduction, 0);
  assert.equal(r.excluded.length, 1);
});

test('10. Copropiedad sin beneficiario designado', () => {
  const r = computeArticle55BisBenefit(
    [loan({ ownershipType: 'CO_OWNERSHIP', ownershipPercentage: 0.5, isDesignatedBeneficiary: false })],
    records(5_000_000),
    { incomeEstimate: 30 * uta, utaValue: uta }, params
  );
  // Por ahora el porcentaje de propiedad NO se aplica automáticamente a la deducción
  // (mantenemos la información separada para futuras reglas más completas).
  // El crédito sigue incluido pero con advertencia de validación documental.
  assert.equal(r.eligibleInterest, 5_000_000);
  assert.equal(r.deduction, 5_000_000);
  assert.ok(r.warnings.some(w => /propiedad|design/i.test(w.message)), 'Debe emitir advertencia de validacion documental');
});

test('11. Exclusión de capital, seguros y otros cargos', () => {
  const r = computeArticle55BisBenefit(
    [loan()],
    [{ mortgageLoanId: 'x', interestPaid: 4_000_000, principalPaid: 10_000_000, insurancePaid: 800_000, otherCharges: 200_000 }],
    { incomeEstimate: 30 * uta, utaValue: uta }, params
  );
  assert.equal(r.baseDeductibleInterest, 4_000_000);
  assert.equal(r.deduction, 4_000_000);
  // El capital, seguros y otros cargos no deben aparecer en la base deducible.
  assert.equal(r.principalPaidTotal, 10_000_000);
  assert.equal(r.insurancePaidTotal, 800_000);
  assert.equal(r.otherChargesTotal, 200_000);
});

test('12. Integración con APV B sin doble rebaja', () => {
  const sources = [{ active: true, name: 'T', kind: 'SALARY', inputMode: 'GROSS', amount: 3_000_000, months: 12, afpName: 'UNO', healthSystem: 'FONASA', contractType: 'INDEFINITE', apvRegime: 'NONE' }];
  const s1 = simulatePortfolio(sources, defaultSettings, { annualAmount: 0, regime: 'NONE' }, {
    mortgages: [loan()],
    annualRecords: records(5_000_000)
  });
  const s2 = simulatePortfolio(sources, defaultSettings, { annualAmount: 2_000_000, regime: 'B' }, {
    mortgages: [loan()],
    annualRecords: records(5_000_000)
  });
  assert.equal(Number(s1.totals.mortgageDeduction), 5_000_000);
  assert.equal(Number(s2.totals.mortgageDeduction), 5_000_000);
  assert.ok(Number(s2.totals.taxableIncome) < Number(s1.totals.taxableIncome), 'APV B debe reducir la base adicionalmente');
});

test('13. Fallback a annualInterestPaid del crédito sin registro anual', () => {
  // El widget de dividendos mensuales escribe los intereses en el crédito
  // (annualInterestPaid) pero puede no existir aún un registro anual. El motor
  // no debe devolver 0 de beneficio en ese caso.
  const r = computeArticle55BisBenefit(
    [loan({ annualInterestPaid: 4_293_238.49, annualPrincipalPaid: 10_106_761.51 })],
    [],
    { incomeEstimate: 30 * uta, utaValue: uta }, params
  );
  assert.equal(r.totalInterestPaid, 4_293_238.49);
  assert.equal(r.eligibleInterest, 4_293_238.49);
  assert.equal(r.baseDeductibleInterest, 4_293_238.49);
  assert.equal(r.deduction, 4_293_238.49);
  assert.equal(r.principalPaidTotal, 10_106_761.51);
});

test('14. El registro anual tiene prioridad sobre el crédito', () => {
  const r = computeArticle55BisBenefit(
    [loan({ annualInterestPaid: 4_293_238.49 })],
    records(3_000_000),
    { incomeEstimate: 30 * uta, utaValue: uta }, params
  );
  assert.equal(r.totalInterestPaid, 3_000_000);
  assert.equal(r.deduction, 3_000_000);
});
