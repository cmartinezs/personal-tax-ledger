import { assertIncomeRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';

export function createIncomeUseCases({ repository }) {
  assertIncomeRepositoryContract(repository);
  return {
    async listIncomeSources(context, taxYear) {
      assertWorkspaceContext(context);
      return repository.list(context, taxYear);
    },
    async getIncomeSource(context, id) {
      assertWorkspaceContext(context);
      return repository.get(context, id);
    },
    async createIncomeSource(context, input) {
      assertWorkspaceContext(context);
      return repository.create(context, input);
    },
    async updateIncomeSource(context, id, input) {
      assertWorkspaceContext(context);
      return repository.update(context, id, input);
    },
    async deleteIncomeSource(context, id) {
      assertWorkspaceContext(context);
      return repository.remove(context, id);
    },
    async copyIncomeSources(context, fromTaxYear, toTaxYear) {
      assertWorkspaceContext(context);
      return repository.copy(context, fromTaxYear, toTaxYear);
    }
  };
}
