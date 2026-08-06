import { assertExecutionLogRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';
import { createSqliteDatabase } from './database/database.mjs';

export function createSqliteExecutionLogRepository(delegate, database) {
  let resolved;
  async function resolveDelegate() {
    return delegate || database || (resolved ??= createSqliteDatabase());
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
