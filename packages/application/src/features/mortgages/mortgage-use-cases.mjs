import { assertMortgageRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';

export function createMortgageUseCases({ repository }) {
  assertMortgageRepositoryContract(repository);
  return {
    async listMortgageLoans(context, filters) {
      assertWorkspaceContext(context);
      return repository.list(context, filters);
    },
    async getMortgageLoan(context, id) {
      assertWorkspaceContext(context);
      return repository.get(context, id);
    },
    async createMortgageLoan(context, input) {
      assertWorkspaceContext(context);
      return repository.create(context, input);
    },
    async updateMortgageLoan(context, id, input) {
      assertWorkspaceContext(context);
      return repository.update(context, id, input);
    },
    async deleteMortgageLoan(context, id) {
      assertWorkspaceContext(context);
      return repository.remove(context, id);
    }
  };
}
