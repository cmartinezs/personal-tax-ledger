export function createTaxRuleSourceRouter({ useCases, readBody, json, apiError }) {
  return async function routeTaxRuleSources({ req, res, path, url }) {
    if (path === '/api/tax-rule-sources' && req.method === 'GET') {
      const ruleKey = url.searchParams.get('ruleKey');
      const year = url.searchParams.get('taxYear') ? Number(url.searchParams.get('taxYear')) : null;
      json(res, 200, await useCases.listTaxRuleSources(null, ruleKey, year));
      return true;
    }
    if (path === '/api/tax-rule-sources' && req.method === 'POST') {
      const body = await readBody(req);
      json(res, 201, await useCases.upsertTaxRuleSource(null, body));
      return true;
    }
    const sourceMatch = path.match(/^\/api\/tax-rule-sources\/([^/]+)$/);
    if (sourceMatch && req.method === 'DELETE') {
      const deleted = await useCases.deleteTaxRuleSource(null, sourceMatch[1]);
      if (deleted) json(res, 204, {}); else apiError(res, 404, 'not_found', 'Fuente no encontrada');
      return true;
    }
    return false;
  };
}