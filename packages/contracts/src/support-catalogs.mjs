export const REFERENCE_REPOSITORY_METHODS = Object.freeze(['list']);
export function assertReferenceRepositoryContract(repository) {
  for (const method of REFERENCE_REPOSITORY_METHODS) { if (typeof repository?.[method] !== 'function') throw new TypeError(`Referencias requiere ${method}()`); }
  return repository;
}
export const YEAR_REPOSITORY_METHODS = Object.freeze(['list']);
export function assertYearRepositoryContract(repository) {
  for (const method of YEAR_REPOSITORY_METHODS) { if (typeof repository?.[method] !== 'function') throw new TypeError(`Años requiere ${method}()`); }
  return repository;
}
export const SNAPSHOT_REPOSITORY_METHODS = Object.freeze(['create']);
export function assertSnapshotRepositoryContract(repository) {
  for (const method of SNAPSHOT_REPOSITORY_METHODS) { if (typeof repository?.[method] !== 'function') throw new TypeError(`Snapshots requiere ${method}()`); }
  return repository;
}