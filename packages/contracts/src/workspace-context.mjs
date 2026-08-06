export function assertWorkspaceContext(context) {
  if (!context || typeof context.workspaceId !== 'string' || !context.workspaceId || typeof context.actorId !== 'string' || !context.actorId) {
    throw new TypeError('WorkspaceContext requiere workspaceId y actorId');
  }
  return context;
}

export const LOCAL_WORKSPACE_CONTEXT = Object.freeze({ workspaceId: 'local-workspace', actorId: 'local-user' });
