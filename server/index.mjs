import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import {
  copyIncomeSources,
  createExecutionLog,
  getSettings,
  listExecutionLogs,
  listIncomeSources,
  listReferences,
  listTaxParameters,
  listTaxRuleSources,
  listYears,
  saveSnapshot,
  updateSettings,
  upsertTaxParameter,
  upsertTaxRuleSource,
  deleteTaxRuleSource
} from './lib/database.mjs';
import {
  listFeeReceipts,
  createFeeReceipt,
  getFeeReceipt,
  updateFeeReceipt,
  deleteFeeReceipt,
  duplicateFeeReceipt,
  listFeeExpenseSettings,
  getFeeExpenseSettings,
  upsertFeeExpenseSettings
} from './lib/fee-receipts.mjs';
import {
  listMortgageLoans,
  getMortgageLoan,
  createMortgageLoan,
  updateMortgageLoan,
  deleteMortgageLoan,
  listAnnualRecords,
  createAnnualRecord,
  updateAnnualRecord,
  deleteAnnualRecord
} from './lib/mortgages.mjs';
import { computeFeeReceiptAmounts, consolidateFeeReceipts, computeAcceptedFeeExpense } from './lib/fee-calculator.mjs';
import { computeArticle55BisBenefit } from './lib/mortgage-calculator.mjs';
import { buildScenarios, compareApv, simulatePortfolio } from './lib/calculator.mjs';
import { TAX_PARAMETER_KEYS } from './lib/tax-parameters.mjs';
import { defaultSettings } from './lib/defaults.mjs';
import { ValidationError } from './lib/util.mjs';
import { incomeSourceRequest } from '@personal-tax-ledger/api-contracts';
import { localComposition } from '@personal-tax-ledger/local-app';

const port = Number(process.env.PORT || 3001);
const webDist = resolve('web/dist');

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

function apiError(res, status, code, message, fieldErrors = null) {
  const body = { code, message };
  if (fieldErrors) body.fieldErrors = fieldErrors;
  return json(res, status, body);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) throw new ApiValidationError('payload_too_large', 'Payload demasiado grande');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new ApiValidationError('invalid_json', 'El cuerpo no es JSON válido');
  }
}

class ApiValidationError extends Error {
  constructor(code, message, fieldErrors = null) {
    super(message);
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

function validateSource(body) {
  const allowedKinds = new Set(['SALARY', 'HONORARIA', 'BONUS', 'OTHER']);
  if (!body.name || typeof body.name !== 'string') throw new ApiValidationError('invalid_name', 'El nombre es obligatorio', { name: 'obligatorio' });
  if (!allowedKinds.has(body.kind)) throw new ApiValidationError('invalid_kind', 'Tipo de ingreso inválido', { kind: 'invalido' });
  if (!Number.isFinite(Number(body.amount)) || Number(body.amount) < 0) throw new ApiValidationError('invalid_amount', 'Monto inválido', { amount: 'invalido' });
  return {
    active: body.active !== false,
    name: body.name.trim(),
    kind: body.kind,
    amount: Number(body.amount),
    inputMode: body.inputMode === 'NET' ? 'NET' : 'GROSS',
    frequency: ['MONTHLY', 'ANNUAL', 'ONE_TIME'].includes(body.frequency) ? body.frequency : 'MONTHLY',
    months: Math.min(12, Math.max(1, Number(body.months) || 12)),
    taxable: body.taxable !== false,
    withholdingRate: body.kind === 'HONORARIA' && !(Number(body.withholdingRate) > 0)
      ? Number(getSettings().honorariosRetentionRate)
      : Math.max(0, Number(body.withholdingRate) || 0),
    afpName: body.afpName || 'UNO',
    afpCommissionRate: body.afpCommissionRate === '' || body.afpCommissionRate == null ? null : Number(body.afpCommissionRate),
    healthSystem: ['FONASA', 'ISAPRE', 'NONE'].includes(body.healthSystem) ? body.healthSystem : 'FONASA',
    healthPlanAmount: Math.max(0, Number(body.healthPlanAmount) || 0),
    contractType: body.contractType === 'FIXED' ? 'FIXED' : 'INDEFINITE',
    apvRegime: ['A', 'B'].includes(body.apvRegime) ? body.apvRegime : 'NONE',
    apvPaymentMethod: body.apvPaymentMethod === 'DIRECT' ? 'DIRECT' : 'PAYROLL',
    apvMonthly: Math.max(0, Number(body.apvMonthly) || 0),
    notes: typeof body.notes === 'string' ? body.notes.slice(0, 1000) : '',
    taxYear: Number(body.taxYear) || getSettings().year
  };
}

async function serveStatic(req, res) {
  try {
    const requestPath = new URL(req.url, 'http://localhost').pathname;
    const safePath = requestPath === '/' ? 'index.html' : decodeURIComponent(requestPath).replace(/^\/+/, '');
    let filePath = resolve(webDist, safePath);
    if (!filePath.startsWith(`${webDist}/`) && filePath !== webDist) throw new Error('Ruta estática inválida');
    try {
      const info = await stat(filePath);
      if (info.isDirectory()) filePath = join(filePath, 'index.html');
    } catch {
      filePath = join(webDist, 'index.html');
    }
    const data = await readFile(filePath);
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
    res.writeHead(200, { 'content-type': `${types[extname(filePath)] || 'application/octet-stream'}; charset=utf-8` });
    res.end(data);
  } catch {
    json(res, 404, { error: 'Frontend no compilado. Ejecute npm install y npm run build.' });
  }
}

function queryYear(url, fallbackYear) {
  const y = url.searchParams.get('taxYear');
  if (y == null || y === '') return fallbackYear;
  return Number(y);
}

const repo = {
  listFeeReceipts,
  createFeeReceipt,
  getFeeReceipt,
  updateFeeReceipt,
  deleteFeeReceipt,
  duplicateFeeReceipt,
  listMortgageLoans,
  getMortgageLoan,
  createMortgageLoan,
  updateMortgageLoan,
  deleteMortgageLoan,
  listAnnualRecords,
  createAnnualRecord,
  updateAnnualRecord,
  deleteAnnualRecord,
  getFeeExpenseSettings
};
const routeIncomes = localComposition.createIncomeRouter({ getSettings, queryYear, readBody, json, apiError, validateSource, incomeSourceRequest, copyIncomeSources });

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const path = url.pathname;
    if (path === '/api/health') return json(res, 200, { status: 'ok', year: getSettings().year });
    if (path === '/api/bootstrap' && req.method === 'GET') {
      return json(res, 200, { settings: getSettings(), sources: listIncomeSources(getSettings().year), references: listReferences() });
    }
    if (path === '/api/years' && req.method === 'GET') return json(res, 200, listYears());

    // Execution log (bitácora)
    if (path === '/api/logs' && req.method === 'GET') {
      return json(res, 200, listExecutionLogs({
        kind: url.searchParams.get('kind') || undefined,
        status: url.searchParams.get('status') || undefined,
        operation: url.searchParams.get('operation') || undefined,
        q: url.searchParams.get('q') || undefined,
        page: url.searchParams.get('page') || undefined,
        pageSize: url.searchParams.get('pageSize') || undefined
      }));
    }
    if (path === '/api/logs' && req.method === 'POST') {
      const body = await readBody(req);
      if (!['SYNC', 'ASYNC'].includes(body.kind)) return apiError(res, 400, 'invalid_kind', 'kind debe ser SYNC o ASYNC');
      if (!body.operation || typeof body.operation !== 'string') return apiError(res, 400, 'invalid_operation', 'operation es obligatorio');
      if (!['OK', 'ERROR'].includes(body.status)) return apiError(res, 400, 'invalid_status', 'status debe ser OK o ERROR');
      return json(res, 201, createExecutionLog({ kind: body.kind, operation: body.operation, status: body.status, message: body.message, auditMessage: body.auditMessage, durationMs: body.durationMs }));
    }
    if (path === '/api/settings' && req.method === 'PUT') {
      const body = await readBody(req);
      return json(res, 200, updateSettings({ ...getSettings(), ...body }));
    }
    if (await routeIncomes({ req, res, path, url })) return;

    // -----------------------------------------------------------------------
    // Tax parameters
    // -----------------------------------------------------------------------
    if (path === '/api/tax-parameters' && req.method === 'GET') {
      const year = queryYear(url, getSettings().year);
      return json(res, 200, listTaxParameters(year));
    }
    if (path === '/api/tax-parameters' && req.method === 'PUT') {
      const body = await readBody(req);
      const year = Number(body.taxYear) || getSettings().year;
      if (!body.values || typeof body.values !== 'object') return apiError(res, 400, 'invalid_body', 'Se requiere `values`');
      const updated = {};
      for (const [k, v] of Object.entries(body.values)) updated[k] = upsertTaxParameter(year, k, v);
      return json(res, 200, updated);
    }

    // -----------------------------------------------------------------------
    // Tax rule sources (traceability)
    // -----------------------------------------------------------------------
    if (path === '/api/tax-rule-sources' && req.method === 'GET') {
      const ruleKey = url.searchParams.get('ruleKey');
      const year = url.searchParams.get('taxYear') ? Number(url.searchParams.get('taxYear')) : null;
      return json(res, 200, listTaxRuleSources(ruleKey, year));
    }
    if (path === '/api/tax-rule-sources' && req.method === 'POST') {
      const body = await readBody(req);
      return json(res, 201, upsertTaxRuleSource(body));
    }
    const sourceMatch = path.match(/^\/api\/tax-rule-sources\/([^/]+)$/);
    if (sourceMatch && req.method === 'DELETE') {
      return deleteTaxRuleSource(sourceMatch[1]) ? json(res, 204, {}) : apiError(res, 404, 'not_found', 'Fuente no encontrada');
    }

    // -----------------------------------------------------------------------
    // Fee receipts (boletas)
    // -----------------------------------------------------------------------
    if (path === '/api/fee-receipts' && req.method === 'GET') {
      const filters = {
        taxYear: url.searchParams.get('taxYear'),
        clientName: url.searchParams.get('clientName'),
        status: url.searchParams.get('status'),
        paymentStatus: url.searchParams.get('paymentStatus'),
        withholdingMode: url.searchParams.get('withholdingMode')
      };
      return json(res, 200, repo.listFeeReceipts(filters));
    }
    if (path === '/api/fee-receipts' && req.method === 'POST') {
      const body = await readBody(req);
      return json(res, 201, repo.createFeeReceipt(body));
    }
    const feeMatch = path.match(/^\/api\/fee-receipts\/([^/]+)$/);
    if (feeMatch && req.method === 'GET') {
      const r = repo.getFeeReceipt(feeMatch[1]);
      return r ? json(res, 200, r) : apiError(res, 404, 'not_found', 'Boleta no encontrada');
    }
    if (feeMatch && req.method === 'PUT') {
      const updated = repo.updateFeeReceipt(feeMatch[1], await readBody(req));
      return updated ? json(res, 200, updated) : apiError(res, 404, 'not_found', 'Boleta no encontrada');
    }
    if (feeMatch && req.method === 'DELETE') {
      return repo.deleteFeeReceipt(feeMatch[1]) ? json(res, 204, {}) : apiError(res, 404, 'not_found', 'Boleta no encontrada');
    }
    const feeDupMatch = path.match(/^\/api\/fee-receipts\/([^/]+)\/duplicate$/);
    if (feeDupMatch && req.method === 'POST') {
      const r = repo.duplicateFeeReceipt(feeDupMatch[1]);
      return r ? json(res, 201, r) : apiError(res, 404, 'not_found', 'Boleta no encontrada');
    }

    // -----------------------------------------------------------------------
    // Fee expense settings
    // -----------------------------------------------------------------------
    if (path === '/api/fee-expense-settings' && req.method === 'GET') return json(res, 200, listFeeExpenseSettings());
    if (path === '/api/fee-expense-settings' && req.method === 'PUT') {
      const body = await readBody(req);
      return json(res, 200, upsertFeeExpenseSettings(body.taxYear, body));
    }
    const feeExpMatch = path.match(/^\/api\/fee-expense-settings\/(\d+)$/);
    if (feeExpMatch && req.method === 'GET') {
      const r = repo.getFeeExpenseSettings(feeExpMatch[1]);
      return r ? json(res, 200, r) : apiError(res, 404, 'not_found', 'Configuración de gastos no encontrada');
    }

    // -----------------------------------------------------------------------
    // Mortgages
    // -----------------------------------------------------------------------
    if (path === '/api/mortgages' && req.method === 'GET') {
      const filters = { taxYear: url.searchParams.get('taxYear'), institutionName: url.searchParams.get('institutionName'), propertyAlias: url.searchParams.get('propertyAlias') };
      return json(res, 200, repo.listMortgageLoans(filters));
    }
    if (path === '/api/mortgages' && req.method === 'POST') {
      const body = await readBody(req);
      return json(res, 201, repo.createMortgageLoan(body));
    }
    const mortgageMatch = path.match(/^\/api\/mortgages\/([^/]+)$/);
    if (mortgageMatch && req.method === 'GET') {
      const r = repo.getMortgageLoan(mortgageMatch[1]);
      return r ? json(res, 200, r) : apiError(res, 404, 'not_found', 'Crédito no encontrado');
    }
    if (mortgageMatch && req.method === 'PUT') {
      const updated = repo.updateMortgageLoan(mortgageMatch[1], await readBody(req));
      return updated ? json(res, 200, updated) : apiError(res, 404, 'not_found', 'Crédito no encontrado');
    }
    if (mortgageMatch && req.method === 'DELETE') {
      return repo.deleteMortgageLoan(mortgageMatch[1]) ? json(res, 204, {}) : apiError(res, 404, 'not_found', 'Crédito no encontrado');
    }
    const annualRecordsMatch = path.match(/^\/api\/mortgages\/([^/]+)\/annual-records$/);
    if (annualRecordsMatch && req.method === 'GET') {
      const filters = { taxYear: url.searchParams.get('taxYear') };
      return json(res, 200, repo.listAnnualRecords(annualRecordsMatch[1], filters));
    }
    if (annualRecordsMatch && req.method === 'POST') {
      const body = await readBody(req);
      return json(res, 201, repo.createAnnualRecord(annualRecordsMatch[1], body));
    }
    const annualRecordMatch = path.match(/^\/api\/mortgage-annual-records\/([^/]+)$/);
    if (annualRecordMatch && req.method === 'PUT') {
      const updated = repo.updateAnnualRecord(annualRecordMatch[1], await readBody(req));
      return updated ? json(res, 200, updated) : apiError(res, 404, 'not_found', 'Registro anual no encontrado');
    }
    if (annualRecordMatch && req.method === 'DELETE') {
      return repo.deleteAnnualRecord(annualRecordMatch[1]) ? json(res, 204, {}) : apiError(res, 404, 'not_found', 'Registro anual no encontrado');
    }

    // -----------------------------------------------------------------------
    // Simulations (with optional new modules)
    // -----------------------------------------------------------------------
    if (path === '/api/simulate' && req.method === 'POST') {
      const body = await readBody(req);
      const settings = { ...getSettings(), ...(body.settings || {}) };
      const sources = body.sources || listIncomeSources(getSettings().year);
      return json(res, 200, simulatePortfolio(sources, settings, body.extraApv, { feeReceipts: body.feeReceipts, mortgages: body.mortgages, annualRecords: body.annualRecords }));
    }
    if (path === '/api/compare-apv' && req.method === 'POST') {
      const body = await readBody(req);
      const settings = { ...getSettings(), ...(body.settings || {}) };
      const sources = body.sources || listIncomeSources(getSettings().year);
      return json(res, 200, compareApv(sources, settings, body.annualContribution, { feeReceipts: body.feeReceipts, mortgages: body.mortgages, annualRecords: body.annualRecords }));
    }
    if (path === '/api/scenarios' && req.method === 'POST') {
      const body = await readBody(req);
      const settings = { ...getSettings(), ...(body.settings || {}) };
      const sources = body.sources || listIncomeSources(getSettings().year);
      return json(res, 200, buildScenarios(sources, settings, { feeReceipts: body.feeReceipts, mortgages: body.mortgages, annualRecords: body.annualRecords }));
    }
    if (path === '/api/article-55-bis' && req.method === 'POST') {
      const body = await readBody(req);
      const settings = { ...getSettings(), ...(body.settings || {}) };
      const year = Number(settings.year) || defaultSettings.year;
      const params = body.params || listTaxParameters(year).reduce((acc, p) => { acc[p.ruleKey] = p.value; return acc; }, {});
      return json(res, 200, computeArticle55BisBenefit(body.mortgages || [], body.annualRecords || [], { incomeEstimate: Number(body.incomeEstimate) || 0, utaValue: settings.utmValue * 12 }, params));
    }
    if (path === '/api/fee-receipt-calc' && req.method === 'POST') {
      const body = await readBody(req);
      const settings = { ...getSettings(), ...(body.settings || {}) };
      const year = Number(settings.year) || defaultSettings.year;
      const params = listTaxParameters(year).reduce((acc, p) => { acc[p.ruleKey] = p.value; return acc; }, {});
      return json(res, 200, computeFeeReceiptAmounts(body.receipt || body, params));
    }
    if (path === '/api/snapshots' && req.method === 'POST') {
      const body = await readBody(req);
      const result = simulatePortfolio(body.sources || listIncomeSources(getSettings().year), body.settings || getSettings(), body.extraApv, { feeReceipts: body.feeReceipts, mortgages: body.mortgages, annualRecords: body.annualRecords });
      return json(res, 201, { id: saveSnapshot(body.name || 'Simulación', body, result), result });
    }
    if (path.startsWith('/api/')) return apiError(res, 404, 'not_found', 'Ruta no encontrada');
    return serveStatic(req, res);
  } catch (error) {
    if (error instanceof ApiValidationError) return apiError(res, 400, error.code, error.message, error.fieldErrors);
    if (error instanceof ValidationError) return apiError(res, 400, error.code, error.message, error.fieldErrors);
    console.error(error);
    return apiError(res, 400, 'unexpected', error instanceof Error ? error.message : 'Error inesperado');
  }
});

server.listen(port, () => console.log(`API disponible en http://localhost:${port}`));
