export function createReferenceRouter({ useCases, json }) {
  return async function routeReferences({ req, res, path }) {
    if (path === '/api/references' && req.method === 'GET') { json(res, 200, await useCases.listReferences()); return true; }
    return false;
  };
}

export function createYearRouter({ useCases, json }) {
  return async function routeYears({ req, res, path }) {
    if (path === '/api/years' && req.method === 'GET') { json(res, 200, await useCases.listYears()); return true; }
    return false;
  };
}

export function createSnapshotRouter({ useCases, readBody, json, simulatePortfolio, listIncomeSources, getSettings }) {
  return async function routeSnapshots({ req, res, path }) {
    if (path === '/api/snapshots' && req.method === 'POST') {
      const body = await readBody(req);
      const result = simulatePortfolio(body.sources || listIncomeSources(getSettings().year), body.settings || getSettings(), body.extraApv, { feeReceipts: body.feeReceipts, mortgages: body.mortgages, annualRecords: body.annualRecords });
      json(res, 201, { id: await useCases.saveSnapshot(body.name || 'Simulación', body, result), result });
      return true;
    }
    return false;
  };
}