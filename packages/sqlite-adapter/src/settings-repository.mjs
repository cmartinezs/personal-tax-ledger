import { assertSettingsRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';
import { createSqliteDatabase } from './database/database.mjs';

export function createSqliteSettingsRepository(delegate, database) {
  let resolved;
  async function resolveDelegate() {
    return delegate || database || (resolved ??= createSqliteDatabase());
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
