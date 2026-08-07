export const MORTGAGE_ANNUAL_RECORD_REPOSITORY_METHODS = Object.freeze(['listByLoan', 'listByYear', 'get', 'create', 'update', 'remove']);

export function assertMortgageAnnualRecordRepositoryContract(repository) {
  for (const method of MORTGAGE_ANNUAL_RECORD_REPOSITORY_METHODS) {
    if (typeof repository?.[method] !== 'function') throw new TypeError(`El repositorio de registros anuales hipotecarios requiere ${method}()`);
  }
  return repository;
}
