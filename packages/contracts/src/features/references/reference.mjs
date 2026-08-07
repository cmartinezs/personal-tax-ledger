export const REFERENCE_REPOSITORY_METHODS = Object.freeze(["list"]);
export function assertReferenceRepositoryContract(repository) {
  for (const method of REFERENCE_REPOSITORY_METHODS) { if (typeof repository?.[method] !== "function") throw new TypeError(`Referencias requiere ${method}()`); }
  return repository;
}
