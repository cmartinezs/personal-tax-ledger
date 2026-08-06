import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  createSqliteDatabase,
  createSqliteFeeExpenseSettingsRepository,
  createSqliteFeeReceiptRepository
} from '@personal-tax-ledger/sqlite-adapter';

const context = { workspaceId: 'local-workspace', actorId: 'local-user' };

test('el adapter SQLite de boletas preserva CRUD, recomputación, duplicación y gastos', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'personal-tax-ledger-a73-'));
  const database = createSqliteDatabase({ path: join(directory, 'adapter.sqlite') });
  try {
    const receipts = createSqliteFeeReceiptRepository(undefined, database);
    const expenses = createSqliteFeeExpenseSettingsRepository(undefined, database);
    const created = await receipts.create(context, {
      taxYear: 2026,
      issueDate: '2026-02-01',
      clientName: 'Cliente adapter',
      amountInputType: 'GROSS',
      grossAmount: 1_000_000,
      withholdingMode: 'WITHHELD_BY_RECIPIENT',
      withholdingRate: 0.01,
      paymentStatus: 'PENDING'
    });
    assert.equal(created.grossAmount, 1_000_000);
    assert.equal(created.withheldAmount, 152_500);
    assert.equal(created.netAmount, 847_500);

    const duplicated = await receipts.duplicate(context, created.id);
    assert.notEqual(duplicated.id, created.id);
    assert.equal((await receipts.list(context, { taxYear: 2026 })).length, 2);

    const updated = await receipts.update(context, created.id, { status: 'CANCELLED' });
    assert.equal(updated.status, 'CANCELLED');
    assert.equal((await receipts.get(context, created.id)).status, 'CANCELLED');
    assert.equal(await receipts.remove(context, duplicated.id), true);
    assert.equal((await receipts.list(context, { taxYear: 2026 })).length, 1);

    const expense = await expenses.upsert(context, 2026, { expenseMode: 'ACTUAL', actualAnnualExpenses: 2_500_000, notes: 'Gastos reales' });
    assert.equal(expense.expenseMode, 'ACTUAL');
    assert.equal(expense.actualAnnualExpenses, 2_500_000);
    assert.equal((await expenses.get(context, 2026)).notes, 'Gastos reales');
  } finally {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
