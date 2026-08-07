import { assertFeeReceiptRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';

export function createFeeReceiptUseCases({ repository }) {
  assertFeeReceiptRepositoryContract(repository);
  return {
    async listFeeReceipts(context, filters) {
      assertWorkspaceContext(context);
      return repository.list(context, filters);
    },
    async getFeeReceipt(context, id) {
      assertWorkspaceContext(context);
      return repository.get(context, id);
    },
    async createFeeReceipt(context, input) {
      assertWorkspaceContext(context);
      return repository.create(context, input);
    },
    async updateFeeReceipt(context, id, input) {
      assertWorkspaceContext(context);
      return repository.update(context, id, input);
    },
    async deleteFeeReceipt(context, id) {
      assertWorkspaceContext(context);
      return repository.remove(context, id);
    },
    async duplicateFeeReceipt(context, id) {
      assertWorkspaceContext(context);
      return repository.duplicate(context, id);
    }
  };
}
