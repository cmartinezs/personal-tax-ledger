export const packageName = '@personal-tax-ledger/contracts';

export const LOCAL_WORKSPACE_CONTEXT = Object.freeze({ workspaceId: 'local-workspace', actorId: 'local-user' });
export const INCOME_REPOSITORY_METHODS = Object.freeze(['list', 'get', 'create', 'update', 'remove', 'copy']);

export function assertWorkspaceContext(context) {
  if (!context || typeof context.workspaceId !== 'string' || !context.workspaceId || typeof context.actorId !== 'string' || !context.actorId) {
    throw new TypeError('WorkspaceContext requiere workspaceId y actorId');
  }
  return context;
}

export function assertRepositoryContract(repository) {
  for (const method of INCOME_REPOSITORY_METHODS) {
    if (typeof repository?.[method] !== 'function') throw new TypeError(`El repositorio de ingresos requiere ${method}()`);
  }
  return repository;
}
