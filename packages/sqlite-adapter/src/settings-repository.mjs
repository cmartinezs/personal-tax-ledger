import { assertSettingsRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';
import { resolveDatabaseModule } from './database.mjs';

export function createSqliteSettingsRepository(delegate) {
  async function resolveDelegate() {
    return delegate || resolveDatabaseModule();
  }
  const repository = {
    async get(context) {
      assertWorkspaceContext(context);
      const { getSettings } = await resolveDelegate();
      return getSettings();
    },
    async update(context, data) {
      assertWorkspaceContext(context);
      const { updateSettings } = await resolveDelegate();
      return updateSettings(data);
    }
  };
  return assertSettingsRepositoryContract(repository);
}
