import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { createSettingsUseCases } from '@personal-tax-ledger/application';
import { createSqliteSettingsRepository } from '@personal-tax-ledger/sqlite-adapter';
import { createSettingsRouter } from '../../../server/routes/settings.mjs';

export function createSettingsComposition(dependencies) {
  const repository = dependencies?.settingsRepository || createSqliteSettingsRepository();
  const useCases = createSettingsUseCases({ repository });
  return {
    settingsRepository: repository,
    settingsUseCases: useCases,
    createSettingsRouter: routerDependencies => createSettingsRouter({ ...routerDependencies, useCases, context: LOCAL_WORKSPACE_CONTEXT })
  };
}
