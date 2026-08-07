import { assertFeeExpenseSettingsRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';

export function createFeeExpenseSettingsUseCases({ repository }) {
  assertFeeExpenseSettingsRepositoryContract(repository);
  return {
    async listFeeExpenseSettings(context) {
      assertWorkspaceContext(context);
      return repository.list(context);
    },
    async getFeeExpenseSettings(context, taxYear) {
      assertWorkspaceContext(context);
      return repository.get(context, taxYear);
    },
    async upsertFeeExpenseSettings(context, taxYear, data) {
      assertWorkspaceContext(context);
      return repository.upsert(context, taxYear, data);
    }
  };
}
