import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeFeeReceiptPreview,
  computeFeeSummary,
  filterFeeReceipts,
  buildDividendSchedule,
  sanitizeMortgageLoan,
  annualRecordsByLoan,
  findAnnualInterest,
  isRegimeA,
  isRegimeB,
  baselineAnnualTax,
  scenarioApvBenefit,
  filterReferences,
  filterTaxRuleSources
} from '../dist/index.js';

test('coordina preview y resumen de honorarios', () => {
  const preview = computeFeeReceiptPreview({ amountInputType: 'GROSS', grossAmount: 1000, netAmount: 0, withholdingMode: 'WITHHELD_BY_RECIPIENT', withholdingRate: 0 }, { honorariosRetentionRate: 0.15 });
  assert.deepEqual(preview, { grossAmount: 1000, netAmount: 850, withholdingRate: 0.15, withheldAmount: 150, ppmPaidAmount: 0 });

  const summary = computeFeeSummary([
    { status: 'ACTIVE', paymentStatus: 'PAID', grossAmount: 1000, withholdingMode: 'WITHHELD_BY_RECIPIENT', withheldAmount: 150, ppmPaidAmount: 0, netAmount: 850 },
    { status: 'CANCELLED', paymentStatus: 'PAID', grossAmount: 500, withholdingMode: 'NO_WITHHOLDING', withheldAmount: 0, ppmPaidAmount: 0, netAmount: 500 }
  ], { feeRecognitionMode: 'ISSUE_DATE' });
  assert.equal(summary.totalGrossIssued, 1000);
  assert.equal(summary.cancelledCount, 1);
  assert.equal(summary.totalWithheldByThirds, 150);
});

test('filtra honorarios sin alterar el arreglo original', () => {
  const receipts = [
    { clientName: 'Beta', status: 'ACTIVE', paymentStatus: 'PAID', withholdingMode: 'NO_WITHHOLDING', issueDate: '2026-02-01', grossAmount: 200 },
    { clientName: 'Alpha', status: 'ACTIVE', paymentStatus: 'PENDING', withholdingMode: 'NO_WITHHOLDING', issueDate: '2026-01-01', grossAmount: 400 }
  ];
  const result = filterFeeReceipts(receipts, { clientName: 'alpha' }, 'date');
  assert.equal(result[0].clientName, 'Alpha');
  assert.equal(receipts[0].clientName, 'Beta');
});

test('coordina calendario hipotecario y registros anuales', () => {
  const schedule = buildDividendSchedule({ initialBalance: 1200, annualRate: 12, dividends: [110, null] });
  assert.deepEqual(schedule.rows[0], { month: 0, dividend: 110, interest: 12, principal: 98, balance: 1102 });
  assert.equal(schedule.paidMonths, 1);
  assert.equal(schedule.finalBalance, 1102);

  const loan = sanitizeMortgageLoan({ institutionName: ' Banco ', propertyAlias: ' Casa ', annualInterestPaid: -4, originalPrincipal: 100, outstandingPrincipal: 80, monthlyPayment: 10, annualPrincipalPaid: null, annualInsurancePaid: null, annualOtherCharges: null });
  assert.equal(loan.institutionName, 'Banco');
  assert.equal(loan.propertyAlias, 'Casa');
  assert.equal(loan.annualInterestPaid, 0);

  const records = [{ mortgageLoanId: 'm1', taxYear: 2026, interestPaid: 30 }, { mortgageLoanId: 'm1', taxYear: 2025, interestPaid: 20 }, { mortgageLoanId: 'm2', taxYear: 2026, interestPaid: 99 }];
  assert.deepEqual(annualRecordsByLoan('m1', records).map(record => record.taxYear), [2026, 2025]);
  assert.equal(findAnnualInterest('m1', records), 30);
});

test('coordina beneficios de escenarios y filtros de fuentes', () => {
  const scenarios = [
    { key: 'base', result: { totals: { annualTax: 1000 } } },
    { key: 'apv-a', result: { totals: { apvAContributions: 1, apvABonus: 150 } } },
    { key: 'apv-b', result: { totals: { apvBAccepted: 1, annualTax: 700 } } }
  ];
  assert.equal(isRegimeA(scenarios[1].result), true);
  assert.equal(isRegimeB(scenarios[2].result), true);
  assert.equal(baselineAnnualTax(scenarios), 1000);
  assert.equal(scenarioApvBenefit(scenarios[1], scenarios), 150);
  assert.equal(scenarioApvBenefit(scenarios[2], scenarios), -300);

  assert.equal(filterReferences([{ authority: 'SII', title: 'Retenciones', appliesTo: 'Honorarios' }], 'honorarios').length, 1);
  assert.equal(filterTaxRuleSources([{ ruleKey: 'fee_rate', institution: 'SII', title: 'Tasa' }], 'fee').length, 1);
});
