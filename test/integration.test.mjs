import test from 'node:test';
import assert from 'node:assert/strict';
import { simulatePortfolio, buildScenarios } from '@personal-tax-ledger/core/calculator';
import { defaultSettings } from '@personal-tax-ledger/core/defaults';
import { TAX_PARAMETER_KEYS } from '@personal-tax-ledger/core/tax-parameters';

const params = {
  [TAX_PARAMETER_KEYS.FEE_WITHHOLDING_RATE]: 0.1525,
  [TAX_PARAMETER_KEYS.FEE_PRESUMED_EXPENSE_RATE]: 0.30,
  [TAX_PARAMETER_KEYS.FEE_PRESUMED_EXPENSE_MAX_UTA]: 15,
  [TAX_PARAMETER_KEYS.MORTGAGE_INTEREST_MAX_UTA]: 8,
  [TAX_PARAMETER_KEYS.MORTGAGE_FULL_BENEFIT_INCOME_MAX_UTA]: 90,
  [TAX_PARAMETER_KEYS.MORTGAGE_PARTIAL_BENEFIT_INCOME_MAX_UTA]: 150,
  [TAX_PARAMETER_KEYS.MORTGAGE_PARTIAL_FORMULA_CONSTANT]: 250,
  [TAX_PARAMETER_KEYS.MORTGAGE_PARTIAL_FORMULA_FACTOR]: 1.667
};

const settings = { ...defaultSettings };

test('Escenario integral: 2 empleadores + 3 boletas + PPM + hipotecario + APV A y B', () => {
  const sources = [
    { active: true, name: 'Empleador 1', kind: 'SALARY', inputMode: 'GROSS', amount: 2_500_000, months: 12, afpName: 'UNO', healthSystem: 'FONASA', contractType: 'INDEFINITE', apvRegime: 'NONE' },
    { active: true, name: 'Empleador 2', kind: 'SALARY', inputMode: 'GROSS', amount: 1_800_000, months: 12, afpName: 'UNO', healthSystem: 'FONASA', contractType: 'INDEFINITE', apvRegime: 'NONE' }
  ];

  const feeReceipts = [
    { id: 'f1', taxYear: 2026, issueDate: '2026-01-15', clientName: 'X', amountInputType: 'GROSS', grossAmount: 1_200_000, netAmount: 1_017_000, withholdingMode: 'WITHHELD_BY_RECIPIENT', withholdingRate: 0.1525, withheldAmount: 183_000, ppmPaidAmount: 0, taxable: true, status: 'ACTIVE', paymentStatus: 'PAID' },
    { id: 'f2', taxYear: 2026, issueDate: '2026-03-20', clientName: 'Y', amountInputType: 'GROSS', grossAmount: 800_000, netAmount: 800_000, withholdingMode: 'PPM_PAID_BY_ISSUER', withholdingRate: 0.1525, withheldAmount: 0, ppmPaidAmount: 122_000, taxable: true, status: 'ACTIVE', paymentStatus: 'PAID' },
    // PPM de 122.000 (≈800.000*0.1525)
    { id: 'f3', taxYear: 2026, issueDate: '2026-06-05', clientName: 'Z', amountInputType: 'GROSS', grossAmount: 500_000, netAmount: 500_000, withholdingMode: 'NO_WITHHOLDING', withholdingRate: 0, withheldAmount: 0, ppmPaidAmount: 0, taxable: true, status: 'ACTIVE', paymentStatus: 'PAID' }
  ];

  const mortgages = [
    { id: 'm1', taxYear: 2026, institutionName: 'Banco', propertyAlias: 'Casa', purpose: 'PURCHASE', ownershipType: 'SOLE_OWNER', ownershipPercentage: 1, isDesignatedBeneficiary: true, eligibleForArticle55Bis: true, annualInterestPaid: 3_500_000 }
  ];
  const annualRecords = [{ mortgageLoanId: 'm1', taxYear: 2026, interestPaid: 3_500_000 }];

  // APV A
  const resultA = simulatePortfolio(sources, settings, { annualAmount: 3_000_000, regime: 'A' }, { feeReceipts, mortgages, annualRecords, params });
  assert.ok(resultA.totals.apvABonus > 0, 'APV A debe generar bono estatal');
  assert.equal(resultA.feeSummary.recognizedGrossForTax, 2_500_000); // 1.2M + 800k + 500k
  assert.equal(resultA.feeSummary.recognizedPPMForTax, 122_000);
  assert.equal(resultA.feeSummary.recognizedWithheldForTax, 183_000);
  assert.equal(resultA.mortgageSummary.deduction, 3_500_000);
  assert.equal(resultA.mortgageSummary.applicablePercentage, 100);

  // La base imponible consolidada debe ser al menos 0.
  assert.ok(resultA.totals.taxableIncome >= 0);
  // El impuesto anual debe ser una cifra no negativa.
  assert.ok(resultA.totals.annualTax >= 0);

  // APV B en el mismo escenario: el bono A no se aplica, pero la base baja.
  const resultB = simulatePortfolio(sources, settings, { annualAmount: 3_000_000, regime: 'B' }, { feeReceipts, mortgages, annualRecords, params });
  assert.ok(resultB.totals.apvBAccepted > 0, 'APV B debe aceptar parte del aporte');
  assert.ok(resultB.totals.apvABonus === 0, 'APV B no genera bono A');
  assert.ok(resultB.totals.annualTax <= resultA.totals.annualTax, 'APV B no debe pagar más impuesto que APV A en este escenario');

  // La rebaja hipotecaria debe ser idéntica entre A y B (no double-count, no exclusion)
  assert.equal(Number(resultA.totals.mortgageDeduction), Number(resultB.totals.mortgageDeduction));

  // Saldo comparativo: B genera saldo menor (más devolución o menos por pagar) que A en este escenario
  // porque el impuesto cae más al rebajar base, no porque el bono sea mayor.
  assert.ok(Number(resultB.totals.estimatedBalance) <= Number(resultA.totals.estimatedBalance));
});

test('Escenario integral: comparación de escenarios devuelve 9+ filas', () => {
  const sources = [
    { active: true, name: 'E', kind: 'SALARY', inputMode: 'GROSS', amount: 3_000_000, months: 12, afpName: 'UNO', healthSystem: 'FONASA', contractType: 'INDEFINITE', apvRegime: 'NONE' }
  ];
  const feeReceipts = [{ id: 'f', taxYear: 2026, issueDate: '2026-01-15', clientName: 'X', amountInputType: 'GROSS', grossAmount: 800_000, netAmount: 678_000, withholdingMode: 'WITHHELD_BY_RECIPIENT', withholdingRate: 0.1525, withheldAmount: 122_000, ppmPaidAmount: 0, taxable: true, status: 'ACTIVE', paymentStatus: 'PAID' }];
  const mortgages = [{ id: 'm', taxYear: 2026, institutionName: 'Banco', propertyAlias: 'Casa', purpose: 'PURCHASE', ownershipType: 'SOLE_OWNER', ownershipPercentage: 1, isDesignatedBeneficiary: true, eligibleForArticle55Bis: true, annualInterestPaid: 2_000_000 }];
  const annualRecords = [{ mortgageLoanId: 'm', taxYear: 2026, interestPaid: 2_000_000 }];

  const scenarios = buildScenarios(sources, settings, { feeReceipts, mortgages, annualRecords });
  assert.ok(scenarios.length >= 9);
  const base = scenarios.find(s => s.key === 'base');
  assert.ok(base);
  assert.equal(Number(base.result.totals.mortgageDeduction), 0, 'El escenario base no debe aplicar rebaja hipotecaria');
  for (const s of scenarios) {
    assert.ok(['base','mortgage','mortgage_apv_a','mortgage_apv_b','fee_with_retention','fee_without_retention','fee_expense_presumed','fee_expense_actual'].includes(s.key) || s.key.startsWith('apv_monthly_'));
  }
  // Diferencias presentes
  for (const s of scenarios) assert.ok(typeof s.diff === 'number');
});
