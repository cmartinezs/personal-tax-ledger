import { assertExecutionLogRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';
import { resolveDatabaseModule } from './database.mjs';

export function createSqliteExecutionLogRepository(delegate) {
  async function resolveDelegate() {
    return delegate || resolveDatabaseModule();
  }
  const repository = {
    async create(context, entry) {
      assertWorkspaceContext(context);
      const { createExecutionLog } = await resolveDelegate();
      return createExecutionLog(entry);
    },
    async list(context, filters) {
      assertWorkspaceContext(context);
      const { listExecutionLogs } = await resolveDelegate();
      return listExecutionLogs(filters);
    }
  };
  return assertExecutionLogRepositoryContract(repository);
}
