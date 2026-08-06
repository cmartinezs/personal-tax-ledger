import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmptyState, FeeReceiptsTable, IncomesSection, Panel, StatusBadge } from '../dist/index.js';

test('shared-ui renderiza componentes públicos desde su fuente', () => {
  const html = renderToStaticMarkup(createElement('div', null,
    createElement(Panel, { title: 'Panel' }, createElement(StatusBadge, { label: 'OK' })),
    createElement(EmptyState, { title: 'Vacío' }),
    createElement(FeeReceiptsTable, { rows: [], formatAmount: value => String(value) }),
    createElement(IncomesSection, { sources: [], taxYear: 2026, prevYears: [], busy: false, formatAmount: String, formatFrequencyLabel: value => value, sourceAnnual: () => 0, sourceHint: () => '', onEdit: () => {}, onRemove: () => {}, onCopyFromPrevious: () => {} })
  ));
  assert.match(html, /Panel/);
  assert.match(html, /Vacío/);
  assert.match(html, /Todavía no hay ingresos/);
});
