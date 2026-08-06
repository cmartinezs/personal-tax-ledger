import { assertFeeExpenseSettingsRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';
import { configureFeeReceiptsDatabase, listFeeExpenseSettings, getFeeExpenseSettings, upsertFeeExpenseSettings } from './database/fee-receipts.mjs';
import { createSqliteDatabase } from './database/database.mjs';

export function createSqliteFeeExpenseSettingsRepository(delegate, database) {
  let resolved;
  async function resolveDelegate() {
    if (delegate) return delegate;
    if (!resolved) {
      const connection = database || createSqliteDatabase();
      configureFeeReceiptsDatabase(connection.db);
      resolved = { listFeeExpenseSettings, getFeeExpenseSettings, upsertFeeExpenseSettings };
    }
    return resolved;
  }
  const repository = {
    async list(context) {
      assertWorkspaceContext(context);
      const { listFeeExpenseSettings } = await resolveDelegate();
      return listFeeExpenseSettings();
    },
    async get(context, taxYear) {
      assertWorkspaceContext(context);
      const { getFeeExpenseSettings } = await resolveDelegate();
      return getFeeExpenseSettings(taxYear);
    },
    async upsert(context, taxYear, data) {
      assertWorkspaceContext(context);
      const { upsertFeeExpenseSettings } = await resolveDelegate();
      return upsertFeeExpenseSettings(taxYear, data);
    }
  };
  return assertFeeExpenseSettingsRepositoryContract(repository);
}
