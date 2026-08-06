import test from 'node:test';
import assert from 'node:assert/strict';
import { computeFeeReceiptAmounts, consolidateFeeReceipts, computeAcceptedFeeExpense } from '../lib/fee-calculator.mjs';
import { defaultSettings } from '../lib/defaults.mjs';
import { TAX_PARAMETER_KEYS } from '../lib/tax-parameters.mjs';

const uta = defaultSettings.utmValue * 12;
const params = {
  [TAX_PARAMETER_KEYS.FEE_WITHHOLDING_RATE]: 0.1525,
  [TAX_PARAMETER_KEYS.FEE_PRESUMED_EXPENSE_RATE]: 0.30,
  [TAX_PARAMETER_KEYS.FEE_PRESUMED_EXPENSE_MAX_UTA]: 15
};

function receipt(overrides = {}) {
  return {
    id: 'x',
    taxYear: 2026,
    issueDate: '2026-04-01',
    clientName: 'A',
    amountInputType: 'GROSS',
    grossAmount: 1_000_000,
    netAmount: 0,
    withholdingMode: 'WITHHELD_BY_RECIPIENT',
    withholdingRate: 0.1525,
    withheldAmount: 0,
    ppmPaidAmount: 0,
    taxable: true,
    status: 'ACTIVE',
    paymentStatus: 'PAID',
    ...overrides
  };
}

test('1. Boleta bruta con retención 2026', () => {
  const c = computeFeeReceiptAmounts(receipt({ grossAmount: 1_000_000 }), params);
  assert.equal(c.grossAmount, 1_000_000);
  assert.equal(c.netAmount, 847_500);
  assert.equal(c.withheldAmount, 152_500);
  assert.equal(c.ppmPaidAmount, 0);
});

test('2. Boleta ingresada como monto líquido', () => {
  const c = computeFeeReceiptAmounts(receipt({ amountInputType: 'NET', netAmount: 847_500, grossAmount: 0 }), params);
  assert.equal(Math.round(c.grossAmount), 1_000_000);
  assert.equal(c.netAmount, 847_500);
  assert.equal(Math.round(c.withheldAmount), 152_500);
});

test('3. Boleta sin retención y PPM pagado', () => {
  const c = computeFeeReceiptAmounts(receipt({ withholdingMode: 'PPM_PAID_BY_ISSUER', grossAmount: 500_000 }), params);
  assert.equal(c.netAmount, 500_000); // cash to issuer is full gross under PPM convention
  assert.equal(Math.round(c.ppmPaidAmount), 76_250);
  assert.equal(c.withheldAmount, 0);
});

test('4. Boleta sin retención y sin PPM', () => {
  const c = computeFeeReceiptAmounts(receipt({ withholdingMode: 'NO_WITHHOLDING', grossAmount: 700_000 }), params);
  assert.equal(c.netAmount, 700_000);
  assert.equal(c.withheldAmount, 0);
  assert.equal(c.ppmPaidAmount, 0);
  assert.equal(c.withholdingRate, 0);
});

test('5. Boleta anulada excluida de los totales tributarios', () => {
  const list = [receipt({ status: 'CANCELLED', grossAmount: 1_000_000 })];
  const summary = consolidateFeeReceipts(list, defaultSettings, params);
  assert.equal(summary.activeCount, 0);
  assert.equal(summary.cancelledCount, 1);
  assert.equal(summary.recognizedGrossForTax, 0);
  assert.equal(summary.totalGrossIssued, 0);
});

test('6. Boleta pendiente según ambos criterios de reconocimiento', () => {
  const list = [receipt({ status: 'ACTIVE', paymentStatus: 'PENDING', grossAmount: 1_000_000 })];
  // ISSUE_DATE incluye la boleta
  const sIssue = consolidateFeeReceipts(list, { ...defaultSettings, feeRecognitionMode: 'ISSUE_DATE' }, params);
  assert.equal(sIssue.recognizedGrossForTax, 1_000_000);
  // PAID_ONLY excluye la boleta pendiente
  const sPaid = consolidateFeeReceipts(list, { ...defaultSettings, feeRecognitionMode: 'PAID_ONLY' }, params);
  assert.equal(sPaid.recognizedGrossForTax, 0);
  assert.equal(sPaid.pendingCount, 1);
});

test('7. Gastos presuntos inferiores al tope de 15 UTA', () => {
  const gross = 10_000_000;
  const e = computeAcceptedFeeExpense(gross, defaultSettings, params);
  assert.equal(e.mode, 'PRESUMED');
  // 30% de 10M = 3M, tope 15 UTA = 15*859788 = 12_896_820, ergo gasto = 3M
  assert.equal(e.acceptedExpense, 3_000_000);
});

test('8. Gastos presuntos superiores al tope de 15 UTA', () => {
  const gross = 100_000_000;
  const e = computeAcceptedFeeExpense(gross, defaultSettings, params);
  // 30% = 30M, tope = 15*859788 = 12_896_820
  assert.equal(e.acceptedExpense, 15 * uta);
});

test('9. Gastos efectivos', () => {
  const gross = 20_000_000;
  const e = computeAcceptedFeeExpense(gross, { ...defaultSettings, honorariosExpenseMethod: 'ACTUAL', honorariosActualAnnualExpenses: 6_000_000 }, params);
  assert.equal(e.mode, 'ACTUAL');
  assert.equal(e.acceptedExpense, 6_000_000);
  // No puede exceder el ingreso bruto
  const e2 = computeAcceptedFeeExpense(2_000_000, { ...defaultSettings, honorariosExpenseMethod: 'ACTUAL', honorariosActualAnnualExpenses: 5_000_000 }, params);
  assert.equal(e2.acceptedExpense, 2_000_000);
});

test('10. Consolidación de múltiples boletas', () => {
  const list = [
    receipt({ id: 'a', grossAmount: 1_000_000, withholdingMode: 'WITHHELD_BY_RECIPIENT', withheldAmount: 152_500, netAmount: 847_500 }),
    receipt({ id: 'b', grossAmount: 500_000, withholdingMode: 'PPM_PAID_BY_ISSUER', ppmPaidAmount: 76_250, netAmount: 500_000 }),
    receipt({ id: 'c', grossAmount: 700_000, withholdingMode: 'NO_WITHHOLDING', netAmount: 700_000 }),
    receipt({ id: 'd', status: 'CANCELLED', grossAmount: 999_999 })
  ];
  const s = consolidateFeeReceipts(list, defaultSettings, params);
  assert.equal(s.activeCount, 3);
  assert.equal(s.cancelledCount, 1);
  assert.equal(s.totalGrossIssued, 2_200_000);
  assert.equal(s.totalWithheldByThirds, 152_500);
  assert.equal(s.totalPPMPaidByIssuer, 76_250);
  assert.equal(s.grossPaidByWithholdingMode.NO_WITHHOLDING, 700_000);
  assert.equal(s.recognizedGrossForTax, 2_200_000);
});
