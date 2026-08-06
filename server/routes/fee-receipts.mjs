export function createFeeReceiptRouter({ useCases, context, readBody, json, apiError }) {
  return async function routeFeeReceipts({ req, res, path, url }) {
    if (path === '/api/fee-receipts' && req.method === 'GET') {
      const filters = {
        taxYear: url.searchParams.get('taxYear'),
        clientName: url.searchParams.get('clientName'),
        status: url.searchParams.get('status'),
        paymentStatus: url.searchParams.get('paymentStatus'),
        withholdingMode: url.searchParams.get('withholdingMode')
      };
      json(res, 200, await useCases.listFeeReceipts(context, filters));
      return true;
    }
    if (path === '/api/fee-receipts' && req.method === 'POST') {
      const body = await readBody(req);
      json(res, 201, await useCases.createFeeReceipt(context, body));
      return true;
    }
    const feeMatch = path.match(/^\/api\/fee-receipts\/([^/]+)$/);
    if (feeMatch && req.method === 'GET') {
      const r = await useCases.getFeeReceipt(context, feeMatch[1]);
      if (r) json(res, 200, r); else apiError(res, 404, 'not_found', 'Boleta no encontrada');
      return true;
    }
    if (feeMatch && req.method === 'PUT') {
      const updated = await useCases.updateFeeReceipt(context, feeMatch[1], await readBody(req));
      if (updated) json(res, 200, updated); else apiError(res, 404, 'not_found', 'Boleta no encontrada');
      return true;
    }
    if (feeMatch && req.method === 'DELETE') {
      if (await useCases.deleteFeeReceipt(context, feeMatch[1])) json(res, 204, {});
      else apiError(res, 404, 'not_found', 'Boleta no encontrada');
      return true;
    }
    const feeDupMatch = path.match(/^\/api\/fee-receipts\/([^/]+)\/duplicate$/);
    if (feeDupMatch && req.method === 'POST') {
      const r = await useCases.duplicateFeeReceipt(context, feeDupMatch[1]);
      if (r) json(res, 201, r); else apiError(res, 404, 'not_found', 'Boleta no encontrada');
      return true;
    }
    return false;
  };
}

export function createFeeExpenseSettingsRouter({ useCases, context, readBody, json, apiError }) {
  return async function routeFeeExpenseSettings({ req, res, path }) {
    if (path === '/api/fee-expense-settings' && req.method === 'GET') {
      json(res, 200, await useCases.listFeeExpenseSettings(context));
      return true;
    }
    if (path === '/api/fee-expense-settings' && req.method === 'PUT') {
      const body = await readBody(req);
      json(res, 200, await useCases.upsertFeeExpenseSettings(context, body.taxYear, body));
      return true;
    }
    const feeExpMatch = path.match(/^\/api\/fee-expense-settings\/(\d+)$/);
    if (feeExpMatch && req.method === 'GET') {
      const r = await useCases.getFeeExpenseSettings(context, feeExpMatch[1]);
      if (r) json(res, 200, r); else apiError(res, 404, 'not_found', 'Configuración de gastos no encontrada');
      return true;
    }
    return false;
  };
}
