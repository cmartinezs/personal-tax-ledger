export function createExecutionLogRouter({ useCases, context, readBody, json, apiError }) {
  return async function routeExecutionLogs({ req, res, path, url }) {
    if (path === '/api/logs' && req.method === 'GET') {
      json(res, 200, await useCases.listExecutionLogs(context, {
        kind: url.searchParams.get('kind') || undefined,
        status: url.searchParams.get('status') || undefined,
        operation: url.searchParams.get('operation') || undefined,
        q: url.searchParams.get('q') || undefined,
        page: url.searchParams.get('page') || undefined,
        pageSize: url.searchParams.get('pageSize') || undefined
      }));
      return true;
    }
    if (path === '/api/logs' && req.method === 'POST') {
      const body = await readBody(req);
      if (!['SYNC', 'ASYNC'].includes(body.kind)) { apiError(res, 400, 'invalid_kind', 'kind debe ser SYNC o ASYNC'); return true; }
      if (!body.operation || typeof body.operation !== 'string') { apiError(res, 400, 'invalid_operation', 'operation es obligatorio'); return true; }
      if (!['OK', 'ERROR'].includes(body.status)) { apiError(res, 400, 'invalid_status', 'status debe ser OK o ERROR'); return true; }
      json(res, 201, await useCases.createExecutionLog(context, {
        kind: body.kind,
        operation: body.operation,
        status: body.status,
        message: body.message,
        auditMessage: body.auditMessage,
        durationMs: body.durationMs
      }));
      return true;
    }
    return false;
  };
}
