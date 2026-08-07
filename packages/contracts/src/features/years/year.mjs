export const YEAR_REPOSITORY_METHODS = Object.freeze(["list"]);
export function assertYearRepositoryContract(repository) {
  for (const method of YEAR_REPOSITORY_METHODS) { if (typeof repository?.[method] !== "function") throw new TypeError(`Años requiere ${method}()`); }
  return repository;
}
