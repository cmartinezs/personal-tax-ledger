import { assertExecutionLogRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';

export function createExecutionLogUseCases({ repository }) {
  assertExecutionLogRepositoryContract(repository);
  return {
    async createExecutionLog(context, entry) {
      assertWorkspaceContext(context);
      return repository.create(context, entry);
    },
    async listExecutionLogs(context, filters) {
      assertWorkspaceContext(context);
      return repository.list(context, filters);
    }
  };
}
