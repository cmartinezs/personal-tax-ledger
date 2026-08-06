export const SETTINGS_REPOSITORY_METHODS = Object.freeze(['get', 'update']);

export function assertSettingsRepositoryContract(repository) {
  for (const method of SETTINGS_REPOSITORY_METHODS) {
    if (typeof repository?.[method] !== 'function') throw new TypeError(`El repositorio de settings requiere ${method}()`);
  }
  return repository;
}
