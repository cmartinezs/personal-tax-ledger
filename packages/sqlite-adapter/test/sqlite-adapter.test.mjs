import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createSqliteDatabase, createSqliteIncomeRepository } from '../src/index.mjs';

test('sqlite-adapter persiste un ingreso en una base temporal', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'personal-tax-ledger-adapter-test-'));
  const database = createSqliteDatabase({ path: join(directory, 'test.sqlite') });
  try {
    const repository = createSqliteIncomeRepository(undefined, database);
    const context = { workspaceId: 'test', actorId: 'user' };
    const created = await repository.create(context, { name: 'Adapter test', kind: 'SALARY', amount: 100, taxYear: 2026 });
    assert.equal((await repository.list(context, 2026))[0].id, created.id);
  } finally {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
