export const TAX_RULE_SOURCE_REPOSITORY_METHODS = Object.freeze(['list', 'upsert', 'remove']);

export function assertTaxRuleSourceRepositoryContract(repository) {
  for (const method of TAX_RULE_SOURCE_REPOSITORY_METHODS) {
    if (typeof repository?.[method] !== 'function') throw new TypeError(`El repositorio de fuentes oficiales requiere ${method}()`);
  }
  return repository;
}