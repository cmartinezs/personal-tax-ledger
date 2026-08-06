import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { IncomesSection, Panel } from '@personal-tax-ledger/shared-ui';
import { defaultSettings, simulatePortfolio } from '@personal-tax-ledger/core';
import { incomeSourceRequest } from '@personal-tax-ledger/api-contracts';
import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';

export function runConsumerSmoke() {
  assert.equal(LOCAL_WORKSPACE_CONTEXT.workspaceId, 'local-workspace');
  assert.equal(incomeSourceRequest({ name: ' External ', amount: '1', taxYear: 2026 }).name, 'External');
  assert.equal(simulatePortfolio([], defaultSettings).totals.annualTax, 0);
  const html = renderToStaticMarkup(createElement(Panel, { title: 'External' }, createElement(IncomesSection, { sources: [], taxYear: 2026, prevYears: [], busy: false, formatAmount: String, formatFrequencyLabel: value => value, sourceAnnual: () => 0, sourceHint: () => '', onEdit: () => {}, onRemove: () => {}, onCopyFromPrevious: () => {} })));
  assert.match(html, /External/);
  assert.match(html, /Todavía no hay ingresos/);
}

if (process.argv[1] && new URL(`file://${process.argv[1]}`).pathname.endsWith('/consumer.mjs')) {
  runConsumerSmoke();
  console.log('external consumer smoke ok');
}
