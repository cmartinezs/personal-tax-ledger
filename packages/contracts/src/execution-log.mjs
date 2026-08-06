export const EXECUTION_LOG_REPOSITORY_METHODS = Object.freeze(['create', 'list']);

export function assertExecutionLogRepositoryContract(repository) {
  for (const method of EXECUTION_LOG_REPOSITORY_METHODS) {
    if (typeof repository?.[method] !== 'function') throw new TypeError(`El repositorio de bitácora requiere ${method}()`);
  }
  return repository;
}
