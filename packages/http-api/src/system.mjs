import { json as respond } from './http-errors.mjs';
import { readJsonBody } from './read-json-body.mjs';

export function createSystemRouter({ useCases, readBody = readJsonBody, json = respond, path }) {
  return async function routeSystem({ req, res, path: requestPath }) {
    if (requestPath === '/api/health' && req.method === 'GET') {
      json(res, 200, await useCases.health());
      return true;
    }
    if (requestPath === '/api/bootstrap' && req.method === 'GET') {
      json(res, 200, await useCases.bootstrap());
      return true;
    }
    if (requestPath === '/api/years' && req.method === 'GET') {
      json(res, 200, await useCases.listYears());
      return true;
    }
    return false;
  };
}

export function createSimulationRouter({ useCases, readBody = readJsonBody, json = respond }) {
  return async function routeSimulation({ req, res, path }) {
    if (path === '/api/simulate' && req.method === 'POST') {
      json(res, 200, await useCases.simulate(await readBody(req)));
      return true;
    }
    if (path === '/api/compare-apv' && req.method === 'POST') {
      json(res, 200, await useCases.compareApv(await readBody(req)));
      return true;
    }
    if (path === '/api/scenarios' && req.method === 'POST') {
      json(res, 200, await useCases.scenarios(await readBody(req)));
      return true;
    }
    if (path === '/api/article-55-bis' && req.method === 'POST') {
      json(res, 200, await useCases.article55Bis(await readBody(req)));
      return true;
    }
    if (path === '/api/fee-receipt-calc' && req.method === 'POST') {
      json(res, 200, await useCases.feeReceiptCalculation(await readBody(req)));
      return true;
    }
    return false;
  };
}
