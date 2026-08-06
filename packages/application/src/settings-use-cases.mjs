import { assertSettingsRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';

export function createSettingsUseCases({ repository }) {
  assertSettingsRepositoryContract(repository);
  return {
    async getSettings(context) {
      assertWorkspaceContext(context);
      return repository.get(context);
    },
    // Coordina lectura + escritura: el repositorio persiste exactamente lo
    // que recibe (sin fusionar), el caso de uso decide que una
    // actualización de settings es una fusión parcial sobre el estado
    // actual (mismo comportamiento observable que server/index.mjs tenía
    // antes de esta migración).
    async updateSettings(context, partialData) {
      assertWorkspaceContext(context);
      const current = await repository.get(context);
      return repository.update(context, { ...current, ...partialData });
    }
  };
}
