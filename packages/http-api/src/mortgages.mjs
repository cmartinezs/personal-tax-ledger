import { apiError as respondError, json as respond } from './http-errors.mjs';
import { readJsonBody } from './read-json-body.mjs';

export function createMortgageRouter({ mortgageUseCases, annualRecordUseCases, context, readBody = readJsonBody, json = respond, apiError = respondError }) {
  return async function routeMortgages({ req, res, path, url }) {
    if (path === '/api/mortgages' && req.method === 'GET') {
      const filters = { taxYear: url.searchParams.get('taxYear'), institutionName: url.searchParams.get('institutionName'), propertyAlias: url.searchParams.get('propertyAlias') };
      json(res, 200, await mortgageUseCases.listMortgageLoans(context, filters));
      return true;
    }
    if (path === '/api/mortgages' && req.method === 'POST') {
      const body = await readBody(req);
      json(res, 201, await mortgageUseCases.createMortgageLoan(context, body));
      return true;
    }
    const mortgageMatch = path.match(/^\/api\/mortgages\/([^/]+)$/);
    if (mortgageMatch && req.method === 'GET') {
      const r = await mortgageUseCases.getMortgageLoan(context, mortgageMatch[1]);
      if (r) json(res, 200, r); else apiError(res, 404, 'not_found', 'Crédito no encontrado');
      return true;
    }
    if (mortgageMatch && req.method === 'PUT') {
      const updated = await mortgageUseCases.updateMortgageLoan(context, mortgageMatch[1], await readBody(req));
      if (updated) json(res, 200, updated); else apiError(res, 404, 'not_found', 'Crédito no encontrado');
      return true;
    }
    if (mortgageMatch && req.method === 'DELETE') {
      if (await mortgageUseCases.deleteMortgageLoan(context, mortgageMatch[1])) json(res, 204, {});
      else apiError(res, 404, 'not_found', 'Crédito no encontrado');
      return true;
    }
    const annualRecordsMatch = path.match(/^\/api\/mortgages\/([^/]+)\/annual-records$/);
    if (annualRecordsMatch && req.method === 'GET') {
      const filters = { taxYear: url.searchParams.get('taxYear') };
      json(res, 200, await annualRecordUseCases.listAnnualRecords(context, annualRecordsMatch[1], filters));
      return true;
    }
    if (annualRecordsMatch && req.method === 'POST') {
      const body = await readBody(req);
      json(res, 201, await annualRecordUseCases.createAnnualRecord(context, annualRecordsMatch[1], body));
      return true;
    }
    const annualRecordMatch = path.match(/^\/api\/mortgage-annual-records\/([^/]+)$/);
    if (annualRecordMatch && req.method === 'PUT') {
      const updated = await annualRecordUseCases.updateAnnualRecord(context, annualRecordMatch[1], await readBody(req));
      if (updated) json(res, 200, updated); else apiError(res, 404, 'not_found', 'Registro anual no encontrado');
      return true;
    }
    if (annualRecordMatch && req.method === 'DELETE') {
      if (await annualRecordUseCases.deleteAnnualRecord(context, annualRecordMatch[1])) json(res, 204, {});
      else apiError(res, 404, 'not_found', 'Registro anual no encontrado');
      return true;
    }
    return false;
  };
}
