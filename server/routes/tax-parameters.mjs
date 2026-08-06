export function createTaxParameterRouter({ useCases, readBody, json, apiError, queryYear }) {
  return async function routeTaxParameters({ req, res, path, url }) {
    if (path === '/api/tax-parameters' && req.method === 'GET') {
      const year = queryYear(url, 2026);
      json(res, 200, await useCases.listTaxParameters(null, year));
      return true;
    }
    if (path === '/api/tax-parameters' && req.method === 'PUT') {
      const body = await readBody(req);
      const year = Number(body.taxYear) || 2026;
      if (!body.values || typeof body.values !== 'object') { apiError(res, 400, 'invalid_body', 'Se requiere `values`'); return true; }
      const updated = {};
      for (const [k, v] of Object.entries(body.values)) updated[k] = await useCases.upsertTaxParameter(null, year, k, v);
      json(res, 200, updated);
      return true;
    }
    return false;
  };
}