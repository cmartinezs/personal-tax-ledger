export function createIncomeRouter({ useCases, context, getSettings, queryYear, readBody, json, apiError, validateSource, copyIncomeSources }) {
  return async function routeIncomes({ req, res, path, url }) {
    if (path === '/api/incomes' && req.method === 'GET') {
      json(res, 200, await useCases.listIncomeSources(context, queryYear(url, getSettings().year)));
      return true;
    }
    if (path === '/api/incomes' && req.method === 'POST') {
      const body = await readBody(req);
      json(res, 201, await useCases.createIncomeSource(context, validateSource(body)));
      return true;
    }
    if (path === '/api/incomes/copy' && req.method === 'POST') {
      const body = await readBody(req);
      const copied = copyIncomeSources(body.fromTaxYear, body.toTaxYear);
      if (copied) json(res, 201, copied);
      else apiError(res, 409, 'already_exists', 'El año destino ya tiene ingresos guardados');
      return true;
    }
    const incomeMatch = path.match(/^\/api\/incomes\/(\d+)$/);
    if (incomeMatch && req.method === 'PUT') {
      const body = await readBody(req);
      const updated = await useCases.updateIncomeSource(context, Number(incomeMatch[1]), validateSource(body));
      if (updated) json(res, 200, updated);
      else apiError(res, 404, 'not_found', 'Ingreso no encontrado');
      return true;
    }
    if (incomeMatch && req.method === 'DELETE') {
      if (await useCases.deleteIncomeSource(context, Number(incomeMatch[1]))) json(res, 204, {});
      else apiError(res, 404, 'not_found', 'Ingreso no encontrado');
      return true;
    }
    return false;
  };
}
