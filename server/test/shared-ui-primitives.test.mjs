import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmptyState, Panel, StatusBadge } from '@personal-tax-ledger/shared-ui';

test('shared-ui exporta primitives presentacionales sin infraestructura', () => {
  const html = renderToStaticMarkup(createElement(Panel, { title: 'Panel' }, createElement(StatusBadge, { label: 'OK', tone: 'positive' })));
  assert.match(html, /Panel/);
  assert.match(html, /shared-status-positive/);
  assert.match(renderToStaticMarkup(createElement(EmptyState, { title: 'Vacío', actionLabel: 'Crear', onAction: () => {} })), /Crear/);
});
