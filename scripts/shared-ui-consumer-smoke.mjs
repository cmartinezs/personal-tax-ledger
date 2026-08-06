import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmptyState, FeeReceiptsTable, IncomesSection, MortgageSummary, Panel, ScenarioTable, SettingsForm, StatusBadge, SummaryMetrics } from '@personal-tax-ledger/shared-ui';

const html = renderToStaticMarkup(createElement('main', null,
  createElement(Panel, { title: 'Smoke' }, createElement(StatusBadge, { label: 'ok' })),
  createElement(EmptyState, { title: 'empty' }),
  createElement(IncomesSection, { sources: [], taxYear: 2026, prevYears: [], busy: false, formatAmount: value => String(value), formatFrequencyLabel: value => value, sourceAnnual: () => 0, sourceHint: () => '', onEdit: () => {}, onRemove: () => {}, onCopyFromPrevious: () => {} }),
  createElement(FeeReceiptsTable, { rows: [], formatAmount: value => String(value) }),
  createElement(MortgageSummary, { loans: [], formatAmount: value => String(value) }),
  createElement(ScenarioTable, { scenarios: [], formatAmount: value => String(value) }),
  createElement(SettingsForm, { fields: [], onChange: () => {}, onSave: () => {} }),
  createElement(SummaryMetrics, { metrics: [] })
));

if (!html.includes('Smoke') || !html.includes('empty')) throw new Error('shared-ui consumer smoke failed');
console.log('shared-ui consumer smoke ok');
