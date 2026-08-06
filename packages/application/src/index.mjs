import { assertRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';

export function createIncomeUseCases({ repository }) {
  assertRepositoryContract(repository);
  return {
    listIncomeSources(context, taxYear) {
      assertWorkspaceContext(context);
      return repository.list(context, taxYear);
    },
    getIncomeSource(context, id) {
      assertWorkspaceContext(context);
      return repository.get(context, id);
    },
    createIncomeSource(context, input) {
      assertWorkspaceContext(context);
      return repository.create(context, input);
    },
    updateIncomeSource(context, id, input) {
      assertWorkspaceContext(context);
      return repository.update(context, id, input);
    },
    deleteIncomeSource(context, id) {
      assertWorkspaceContext(context);
      return repository.remove(context, id);
    }
  };
}
