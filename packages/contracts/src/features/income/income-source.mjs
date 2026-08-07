export const INCOME_REPOSITORY_METHODS = Object.freeze(['list', 'get', 'create', 'update', 'remove', 'copy']);

export function assertIncomeRepositoryContract(repository) {
  for (const method of INCOME_REPOSITORY_METHODS) {
    if (typeof repository?.[method] !== 'function') throw new TypeError(`El repositorio de ingresos requiere ${method}()`);
  }
  return repository;
}
