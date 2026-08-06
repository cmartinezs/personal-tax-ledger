import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { createExecutionLogUseCases } from '@personal-tax-ledger/application';
import { createSqliteExecutionLogRepository } from '@personal-tax-ledger/sqlite-adapter';
import { createExecutionLogRouter } from '../../../server/routes/execution-logs.mjs';

export function createExecutionLogComposition(dependencies) {
  const repository = dependencies?.executionLogRepository || createSqliteExecutionLogRepository();
  const useCases = createExecutionLogUseCases({ repository });
  return {
    executionLogRepository: repository,
    executionLogUseCases: useCases,
    createExecutionLogRouter: routerDependencies => createExecutionLogRouter({ ...routerDependencies, useCases, context: LOCAL_WORKSPACE_CONTEXT })
  };
}
