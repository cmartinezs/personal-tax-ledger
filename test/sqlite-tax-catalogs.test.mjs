import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  createSqliteDatabase,
  createSqliteReferenceRepository,
  createSqliteSnapshotRepository,
  createSqliteTaxParameterRepository,
  createSqliteTaxRuleSourceRepository,
  createSqliteYearRepository
} from '@personal-tax-ledger/sqlite-adapter';

test('el adapter SQLite preserva catálogos versionados, fuentes, snapshots y años', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'personal-tax-ledger-a75-'));
  const database = createSqliteDatabase({ path: join(directory, 'adapter.sqlite') });
  try {
    const taxParameters = createSqliteTaxParameterRepository(undefined, database);
    const sources = createSqliteTaxRuleSourceRepository(undefined, database);
    const references = createSqliteReferenceRepository(undefined, database);
    const years = createSqliteYearRepository(undefined, database);
    const snapshots = createSqliteSnapshotRepository(undefined, database);

    const seeded = await taxParameters.list(null, 2026);
    assert.ok(seeded.some(parameter => parameter.ruleKey === 'fee_withholding_rate'));
    assert.equal(await taxParameters.upsert(null, 2027, 'custom_rule', 0.25, 'number', 'Prueba'), 0.25);
    assert.equal(await taxParameters.get(null, 2027, 'custom_rule'), 0.25);
    assert.equal((await taxParameters.list(null, 2026)).some(parameter => parameter.ruleKey === 'custom_rule'), false);

    const source = await sources.upsert(null, {
      id: 'custom-rule-2027',
      ruleKey: 'custom_rule',
      taxYear: 2027,
      institution: 'SII',
      title: 'Fuente de prueba',
      sourceUrl: 'https://www.sii.cl/prueba',
      retrievedAt: '2027-01-01',
      notes: 'Nota'
    });
    assert.equal(source.id, 'custom-rule-2027');
    assert.equal((await sources.list(null, 'custom_rule', 2027)).length, 1);
    assert.equal(await sources.remove(null, source.id), true);

    assert.ok((await references.list()).length > 0);
    const snapshotId = await snapshots.create('Snapshot de prueba', { year: 2027 }, { total: 123 });
    assert.equal(typeof snapshotId, 'number');
    assert.ok((await years.list()).includes(2027));
  } finally {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
