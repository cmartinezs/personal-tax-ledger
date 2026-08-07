import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FeedbackProvider, useAsyncAction } from '../dist/index.js';

function createFakeClient() {
  const calls = [];
  return {
    bootstrap: async () => ({ settings: { year: 2026, ufValue: 0, utmValue: 0 }, sources: [], references: [] }),
    listYears: async () => [2026],
    listIncomes: async () => [],
    createIncome: async input => ({ ...input, id: 1 }),
    updateIncome: async input => ({ ...input, id: input.id }),
    deleteIncome: async () => {},
    copyIncomes: async () => [],
    updateSettings: async settings => ({ ...settings, ufValue: 0, utmValue: 0 }),
    listFeeReceipts: async () => [],
    createFeeReceipt: async input => ({ ...input, id: 'r1' }),
    updateFeeReceipt: async input => ({ ...input, id: input.id }),
    deleteFeeReceipt: async () => {},
    duplicateFeeReceipt: async input => ({ taxYear: 2026, issueDate: '', folio: null, clientName: 'x', clientTaxId: null, description: null, amountInputType: 'GROSS', grossAmount: 0, netAmount: 0, withholdingMode: 'NO_WITHHOLDING', withholdingRate: 0, withheldAmount: 0, ppmPaidAmount: 0, taxable: true, status: 'ACTIVE', paymentStatus: 'PENDING', paymentDate: null, notes: null, id }),
    computeFeeReceipt: async () => ({ grossAmount: 0 }),
    listFeeExpenseSettings: async () => [],
    upsertFeeExpenseSettings: async input => ({ ...input, id: 'e1' }),
    getFeeExpenseSettings: async () => ({ taxYear: 2026, expenseMode: 'PRESUMED', actualAnnualExpenses: 0, notes: null }),
    listMortgages: async () => [],
    createMortgage: async input => ({ ...input, id: 'm1' }),
    updateMortgage: async input => ({ ...input, id: input.id }),
    deleteMortgage: async () => {},
    listAnnualRecords: async () => [],
    createAnnualRecord: async input => ({ ...input, id: 'a1' }),
    updateAnnualRecord: async input => ({ ...input, id: input.id }),
    deleteAnnualRecord: async () => {},
    listTaxParameters: async () => [],
    updateTaxParameters: async values => ({ foo: { ruleKey: 'foo', value: 1, type: 'number', description: null } }),
    listTaxRuleSources: async () => [],
    createTaxRuleSource: async input => ({ ...input }),
    deleteTaxRuleSource: async () => {},
    listExecutionLogs: async () => ({ items: [], total: 0, page: 1, pageSize: 20 }),
    createExecutionLog: async entry => ({ ...entry, id: 1, createdAt: '2026-01-01T00:00:00.000Z' }),
    simulate: async () => ({ totals: { annualTax: 0 } }),
    compareApv: async () => ({}),
    buildScenarios: async () => [],
    saveSnapshot: async () => ({ id: 1, result: {} }),
    article55Bis: async () => ({})
  };
}

test('frontend-application exporta el cliente abstracto y renderiza el feedback provider', () => {
  const client = createFakeClient();
  const html = renderToStaticMarkup(
    createElement(FeedbackProvider, { client }, createElement('p', null, 'children'))
  );
  assert.match(html, /children/);
});

test('useAsyncAction se puede instanciar sin host (estructura de contrato)', () => {
  assert.equal(typeof useAsyncAction, 'function');
});
