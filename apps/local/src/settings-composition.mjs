import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { createSettingsUseCases } from '@personal-tax-ledger/application';
import { createSqliteSettingsRepository } from '@personal-tax-ledger/sqlite-adapter';
import { createSettingsRouter } from '@personal-tax-ledger/http-api';

export function createSettingsComposition(dependencies) {
  const repository = dependencies?.settingsRepository || createSqliteSettingsRepository(undefined, dependencies?.database);
  const useCases = createSettingsUseCases({ repository });
  return {
    settingsRepository: repository,
    settingsUseCases: useCases,
    createSettingsRouter: routerDependencies => createSettingsRouter({ ...routerDependencies, useCases, context: LOCAL_WORKSPACE_CONTEXT })
  };
}
