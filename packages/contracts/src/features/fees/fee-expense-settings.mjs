export const FEE_EXPENSE_SETTINGS_REPOSITORY_METHODS = Object.freeze(['list', 'get', 'upsert']);

export function assertFeeExpenseSettingsRepositoryContract(repository) {
  for (const method of FEE_EXPENSE_SETTINGS_REPOSITORY_METHODS) {
    if (typeof repository?.[method] !== 'function') throw new TypeError(`El repositorio de gastos de honorarios requiere ${method}()`);
  }
  return repository;
}
