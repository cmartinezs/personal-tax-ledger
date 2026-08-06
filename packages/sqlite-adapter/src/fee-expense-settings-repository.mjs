import { assertFeeExpenseSettingsRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';
import { resolveFeeReceiptsModule } from './fee-receipts-module.mjs';

export function createSqliteFeeExpenseSettingsRepository(delegate) {
  async function resolveDelegate() {
    return delegate || resolveFeeReceiptsModule();
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
