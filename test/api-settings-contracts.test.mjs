import test from 'node:test';
import assert from 'node:assert/strict';
import { bootstrapResponse, referenceResponse, settingsRequest, settingsResponse, yearsResponse } from '@personal-tax-ledger/api-contracts';

test('los DTOs compartidos de settings y bootstrap estabilizan responses y cambio de año', () => {
  const settings = settingsRequest({ year: '2027', currency: 'CLP' });
  assert.equal(settings.year, 2027);
  assert.equal(settings.currency, 'CLP');
  assert.equal(settingsResponse({ ...settings, ufValue: '40000', utmValue: '70000' }).utmValue, 70000);
  assert.deepEqual(yearsResponse(['2027', 2026]), [2027, 2026]);
  assert.deepEqual(referenceResponse({ id: '2', authority: 'SII' }), { id: 2, authority: 'SII', title: '', url: '', appliesTo: '' });
  assert.deepEqual(bootstrapResponse({ settings, sources: null, references: null }), { settings: { ...settings, ufValue: 0, utmValue: 0 }, sources: [], references: [] });
});
