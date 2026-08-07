import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FeeReceiptsTable, MortgageSummary, ScenarioTable, SettingsForm } from '@personal-tax-ledger/shared-ui';

test('shared-ui exporta componentes reutilizables de módulos A10', () => {
  const html = renderToStaticMarkup(createElement('div', null,
    createElement(FeeReceiptsTable, { rows: [{ id: '1', clientName: 'Cliente', issueDate: '2026-01-01', grossAmount: 10, status: 'ACTIVE', paymentStatus: 'PAID' }], formatAmount: value => `$${value}` }),
    createElement(MortgageSummary, { loans: [{ id: '1', propertyAlias: 'Casa', institutionName: 'Banco', annualInterestPaid: 20 }], formatAmount: value => `$${value}` }),
    createElement(ScenarioTable, { scenarios: [{ key: 'base', label: 'Base', balance: 30 }], formatAmount: value => `$${value}` }),
    createElement(SettingsForm, { fields: [{ key: 'year', label: 'Año', value: 2026 }], onChange: () => {}, onSave: () => {} })
  ));
  assert.match(html, /Cliente/);
  assert.match(html, /Casa/);
  assert.match(html, /Base/);
  assert.match(html, /Guardar/);
});
