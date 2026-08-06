import test from 'node:test';
import assert from 'node:assert/strict';
import {
  taxParameterResponse,
  taxParametersFilters,
  taxParametersRequest,
  taxRuleSourceFilters,
  taxRuleSourceRequest,
  taxRuleSourceResponse
} from '@personal-tax-ledger/api-contracts';

test('los DTOs compartidos de catálogos preservan versionado y fuentes oficiales', () => {
  assert.deepEqual(taxParametersRequest({ taxYear: '2027', values: { rate: 0.25 } }), { taxYear: 2027, values: { rate: 0.25 } });
  assert.deepEqual(taxParametersFilters({ taxYear: '2027' }), { taxYear: 2027 });
  assert.deepEqual(taxParameterResponse({ ruleKey: 'rate', value: 0.25 }), { ruleKey: 'rate', value: 0.25, type: 'number', description: null, updatedAt: undefined });
  const source = taxRuleSourceRequest({ ruleKey: 'rate', taxYear: '2027', institution: 'SII', title: 'Fuente', sourceUrl: 'https://sii.cl', retrievedAt: '2027-01-01' });
  assert.equal(source.taxYear, 2027);
  assert.equal(taxRuleSourceResponse(source).sourceUrl, 'https://sii.cl');
  assert.deepEqual(taxRuleSourceFilters({ ruleKey: 'rate', taxYear: '2027' }), { ruleKey: 'rate', taxYear: 2027 });
});
