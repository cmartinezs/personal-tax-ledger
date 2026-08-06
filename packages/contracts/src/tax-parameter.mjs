export const TAX_PARAMETER_REPOSITORY_METHODS = Object.freeze(['list', 'get', 'upsert']);

export function assertTaxParameterRepositoryContract(repository) {
  for (const method of TAX_PARAMETER_REPOSITORY_METHODS) {
    if (typeof repository?.[method] !== 'function') throw new TypeError(`El repositorio de parámetros tributarios requiere ${method}()`);
  }
  return repository;
}