import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  createSqliteDatabase,
  createSqliteExecutionLogRepository,
  createSqliteIncomeRepository,
  createSqliteSettingsRepository
} from '@personal-tax-ledger/sqlite-adapter';
import { createSettingsUseCases } from '@personal-tax-ledger/application';

const context = { workspaceId: 'local-workspace', actorId: 'local-user' };

test('los repositorios SQLite reales preservan settings, incomes y logs', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'personal-tax-ledger-a72-'));
  const database = createSqliteDatabase({ path: join(directory, 'adapter.sqlite') });
  try {
    const settingsRepository = createSqliteSettingsRepository(undefined, database);
    const settings = createSettingsUseCases({ repository: settingsRepository });
    const incomes = createSqliteIncomeRepository(undefined, database);
    const logs = createSqliteExecutionLogRepository(undefined, database);

    const current = await settings.getSettings(context);
    const updated = await settings.updateSettings(context, { year: 2027 });
    assert.equal(updated.year, 2027);
    assert.equal(updated.currency, current.currency);

    await incomes.create(context, { name: 'Ingreso 2026', kind: 'SALARY', amount: 100, taxYear: 2026 });
    await incomes.create(context, { name: 'Ingreso 2027', kind: 'SALARY', amount: 200, taxYear: 2027 });
    assert.equal((await incomes.list(context, 2026)).length, 1);
    assert.equal((await incomes.list(context, 2027)).length, 1);
    assert.equal((await incomes.copy(context, 2026, 2028)).length, 1);
    assert.equal((await incomes.list(context, 2028))[0].taxYear, 2028);
    assert.equal(await incomes.copy(context, 2026, 2027), null);

    await logs.create(context, { kind: 'SYNC', operation: 'test', status: 'OK', message: 'ok', durationMs: 12 });
    const result = await logs.list(context, { operation: 'test' });
    assert.equal(result.total, 1);
    assert.equal(result.items[0].durationMs, 12);
  } finally {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
