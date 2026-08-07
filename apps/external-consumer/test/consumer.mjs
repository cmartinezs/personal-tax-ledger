import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { IncomesSection, Panel } from '@personal-tax-ledger/shared-ui';
import { defaultSettings, simulatePortfolio } from '@personal-tax-ledger/core';
import { incomeSourceRequest } from '@personal-tax-ledger/api-contracts';
import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { createIncomeRouter } from '@personal-tax-ledger/http-api';
import {
  FeedbackProvider,
  createIncomeService,
  createFeeReceiptService,
  createMortgageService
} from '@personal-tax-ledger/frontend-application';

export async function runConsumerSmoke() {
  assert.equal(LOCAL_WORKSPACE_CONTEXT.workspaceId, 'local-workspace');
  assert.equal(incomeSourceRequest({ name: ' External ', amount: '1', taxYear: 2026 }).name, 'External');
  assert.equal(simulatePortfolio([], defaultSettings).totals.annualTax, 0);
  const feedbackHtml = renderToStaticMarkup(createElement(FeedbackProvider, null, createElement('p', null, 'feedback')));
  assert.match(feedbackHtml, /feedback/);
  const calls = [];
  const fakeClient = {
    listIncomes: async year => { calls.push(['listIncomes', year]); return []; },
    createIncome: async input => { calls.push(['createIncome', input]); return { ...input, id: 1 }; },
    updateIncome: async input => { calls.push(['updateIncome', input]); return input; },
    deleteIncome: async id => { calls.push(['deleteIncome', id]); },
    listFeeReceipts: async filters => { calls.push(['listFeeReceipts', filters]); return []; },
    createFeeReceipt: async input => input,
    updateFeeReceipt: async input => input,
    deleteFeeReceipt: async id => { calls.push(['deleteFeeReceipt', id]); },
    duplicateFeeReceipt: async id => ({ id }),
    computeFeeReceipt: async receipt => receipt,
    listFeeExpenseSettings: async () => [],
    upsertFeeExpenseSettings: async input => input,
    getFeeExpenseSettings: async year => ({ taxYear: year }),
    listMortgages: async filters => { calls.push(['listMortgages', filters]); return []; },
    createMortgage: async input => input,
    updateMortgage: async input => input,
    deleteMortgage: async id => { calls.push(['deleteMortgage', id]); },
    listAnnualRecords: async () => [],
    createAnnualRecord: async (_, input) => input,
    updateAnnualRecord: async input => input,
    deleteAnnualRecord: async id => { calls.push(['deleteAnnualRecord', id]); },
    article55Bis: async input => input
  };
  const income = createIncomeService(fakeClient);
  const fees = createFeeReceiptService(fakeClient);
  const mortgages = createMortgageService(fakeClient);
  await income.list(2026);
  await fees.list({ taxYear: 2026 });
  await mortgages.list({ taxYear: 2026 });
  assert.deepEqual(calls, [
    ['listIncomes', 2026],
    ['listFeeReceipts', { taxYear: 2026 }],
    ['listMortgages', { taxYear: 2026 }]
  ]);
  let response;
  const httpRouter = createIncomeRouter({
    context: { workspaceId: 'external', actorId: 'consumer' },
    getSettings: async () => ({ year: 2026 }),
    validateSource: async source => source,
    useCases: {
      listIncomeSources: async (context, year) => ({ context, year, items: [] })
    },
    json: (res, status, body) => { response = { status, body }; res.writeHead(status, {}); res.end(JSON.stringify(body)); }
  });
  const handled = await httpRouter({
    req: { method: 'GET' },
    res: { writeHead() {}, end() {} },
    path: '/api/incomes',
    url: new URL('http://external/api/incomes?taxYear=2026')
  });
  assert.equal(handled, true);
  assert.deepEqual(response.body, { context: { workspaceId: 'external', actorId: 'consumer' }, year: 2026, items: [] });
  const html = renderToStaticMarkup(createElement(Panel, { title: 'External' }, createElement(IncomesSection, { sources: [], taxYear: 2026, prevYears: [], busy: false, formatAmount: String, formatFrequencyLabel: value => value, sourceAnnual: () => 0, sourceHint: () => '', onEdit: () => {}, onRemove: () => {}, onCopyFromPrevious: () => {} })));
  assert.match(html, /External/);
  assert.match(html, /Todavía no hay ingresos/);
}

if (process.argv[1] && new URL(`file://${process.argv[1]}`).pathname.endsWith('/consumer.mjs')) {
  await runConsumerSmoke();
  console.log('external consumer smoke ok');
}
