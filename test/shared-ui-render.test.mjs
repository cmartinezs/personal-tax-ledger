import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { IncomesSection, SummaryMetrics } from '@personal-tax-ledger/shared-ui';

const baseProps = {
  taxYear: 2026,
  prevYears: [2025],
  busy: false,
  formatAmount: value => `$${value}`,
  formatFrequencyLabel: frequency => frequency,
  sourceAnnual: source => source.amount * source.months,
  sourceHint: () => 'Proyección de prueba',
  onEdit: () => {},
  onRemove: () => {},
  onCopyFromPrevious: () => {}
};

test('IncomesSection renderiza la lista de ingresos y sus acciones reales', () => {
  const sources = [{ id: 1, kind: 'SALARY', name: 'Trabajo principal', amount: 1_500_000, frequency: 'MONTHLY', months: 12 }];

  const html = renderToStaticMarkup(createElement(IncomesSection, { ...baseProps, sources }));

  assert.match(html, /Trabajo principal/);
  assert.match(html, /\$1500000/);
  assert.match(html, /Editar/);
  assert.match(html, /Eliminar/);
  assert.match(html, /Fuentes activas/);
});

test('IncomesSection renderiza el estado vacío con la acción de copiar desde el año anterior', () => {
  const html = renderToStaticMarkup(createElement(IncomesSection, { ...baseProps, sources: [], sourceAnnual: () => 0 }));

  assert.match(html, /Todavía no hay ingresos guardados para 2026/);
  assert.match(html, /Copiar desde 2025/);
  assert.doesNotMatch(html, /source-card/);
});

test('IncomesSection no repite el estado vacío cuando no hay años anteriores', () => {
  const html = renderToStaticMarkup(createElement(IncomesSection, { ...baseProps, sources: [], prevYears: [], sourceAnnual: () => 0 }));

  assert.match(html, /Todavía no hay ingresos guardados para 2026/);
  assert.doesNotMatch(html, /Copiar desde/);
});

test('SummaryMetrics renderiza métricas y expone la acción de explicación', () => {
  const html = renderToStaticMarkup(createElement(SummaryMetrics, {
    metrics: [{ key: 'tax.annual', label: 'Impuesto anual', value: '$100', hint: 'Detalle' }],
    onExplain: () => {}
  }));
  assert.match(html, /Impuesto anual/);
  assert.match(html, /\$100/);
  assert.match(html, /Ver cálculo/);
});
