export const MORTGAGE_REPOSITORY_METHODS = Object.freeze(['list', 'get', 'create', 'update', 'remove']);

export function assertMortgageRepositoryContract(repository) {
  for (const method of MORTGAGE_REPOSITORY_METHODS) {
    if (typeof repository?.[method] !== 'function') throw new TypeError(`El repositorio de créditos hipotecarios requiere ${method}()`);
  }
  return repository;
}
