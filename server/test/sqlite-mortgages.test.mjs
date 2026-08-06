import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  createSqliteDatabase,
  createSqliteMortgageAnnualRecordRepository,
  createSqliteMortgageRepository
} from '@personal-tax-ledger/sqlite-adapter';

const context = { workspaceId: 'local-workspace', actorId: 'local-user' };

test('el adapter SQLite de mortgages preserva loans, annual records y snapshot anual', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'personal-tax-ledger-a74-'));
  const database = createSqliteDatabase({ path: join(directory, 'adapter.sqlite') });
  try {
    const mortgages = createSqliteMortgageRepository(undefined, database);
    const annualRecords = createSqliteMortgageAnnualRecordRepository(undefined, database);
    const loan = await mortgages.create(context, {
      taxYear: 2026,
      institutionName: 'Banco adapter',
      propertyAlias: 'Casa adapter',
      purpose: 'PURCHASE',
      ownershipType: 'SOLE_OWNER',
      eligibleForArticle55Bis: true,
      annualInterestPaid: 1_000_000
    });
    assert.equal(loan.annualInterestPaid, 1_000_000);
    assert.equal((await mortgages.list(context, { taxYear: 2026, propertyAlias: 'adapter' })).length, 1);

    const record = await annualRecords.create(context, loan.id, {
      taxYear: 2026,
      interestPaid: 2_000_000,
      principalPaid: 3_000_000
    });
    assert.equal(record.interestPaid, 2_000_000);
    assert.equal((await mortgages.get(context, loan.id)).annualInterestPaid, 2_000_000);
    assert.equal((await annualRecords.listByLoan(context, loan.id, { taxYear: 2026 })).length, 1);

    const updated = await annualRecords.update(context, record.id, { interestPaid: 2_500_000 });
    assert.equal(updated.interestPaid, 2_500_000);
    assert.equal((await mortgages.get(context, loan.id)).annualInterestPaid, 2_500_000);
    assert.equal(await mortgages.remove(context, loan.id), true);
    assert.equal(await annualRecords.get(context, record.id), null);
  } finally {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
