import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { createExecutionLogUseCases } from '@personal-tax-ledger/application';
import { createSqliteExecutionLogRepository } from '@personal-tax-ledger/sqlite-adapter';
import { createExecutionLogRouter } from '@personal-tax-ledger/http-api';

export function createExecutionLogComposition(dependencies) {
  const repository = dependencies?.executionLogRepository || createSqliteExecutionLogRepository(undefined, dependencies?.database);
  const useCases = createExecutionLogUseCases({ repository });
  return {
    executionLogRepository: repository,
    executionLogUseCases: useCases,
    createExecutionLogRouter: routerDependencies => createExecutionLogRouter({ ...routerDependencies, useCases, context: LOCAL_WORKSPACE_CONTEXT })
  };
}
