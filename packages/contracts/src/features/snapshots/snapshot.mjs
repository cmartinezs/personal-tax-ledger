export const SNAPSHOT_REPOSITORY_METHODS = Object.freeze(["create"]);
export function assertSnapshotRepositoryContract(repository) {
  for (const method of SNAPSHOT_REPOSITORY_METHODS) { if (typeof repository?.[method] !== "function") throw new TypeError(`Snapshots requiere ${method}()`); }
  return repository;
}
