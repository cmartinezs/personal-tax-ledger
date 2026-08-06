import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import {
  getSettings,
} from './lib/database.mjs';
import { ValidationError } from './lib/util.mjs';
import { incomeSourceRequest } from '@personal-tax-ledger/api-contracts';
import { createLocalComposition } from '@personal-tax-ledger/local-app';

const configuredPort = Number(process.env.PORT || 3001);
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
  // La normalización de forma (trim, coerción, enums con default) vive en
  // @personal-tax-ledger/api-contracts, compartida con el frontend. Aquí
  // solo quedan la validación de transporte (arriba) y los dos valores
  // que dependen de estado del servidor: el default de retención de
  // honorarios y el año comercial vigente.
  const normalized = incomeSourceRequest(body);
  return {
    ...normalized,
    withholdingRate: normalized.kind === 'HONORARIA' && !(normalized.withholdingRate > 0)
      ? Number(getSettings().honorariosRetentionRate)
      : normalized.withholdingRate,
    taxYear: normalized.taxYear || getSettings().year
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

const localComposition = createLocalComposition();
const routeIncomes = localComposition.createIncomeRouter({ getSettings, queryYear, readBody, json, apiError, validateSource });
const routeSettings = localComposition.createSettingsRouter({ readBody, json });
const routeExecutionLogs = localComposition.createExecutionLogRouter({ readBody, json, apiError });
const routeFeeReceipts = localComposition.createFeeReceiptRouter({ readBody, json, apiError });
const routeFeeExpenseSettings = localComposition.createFeeExpenseSettingsRouter({ readBody, json, apiError });
const routeMortgages = localComposition.createMortgageRouter({ readBody, json, apiError });
const routeTaxParameters = localComposition.createTaxParameterRouter({ readBody, json, apiError, queryYear });
const routeTaxRuleSources = localComposition.createTaxRuleSourceRouter({ readBody, json, apiError });
const routeYears = localComposition.createYearRouter({ json });
const routeSnapshots = localComposition.createSnapshotRouter({ readBody, json, simulate: payload => localComposition.systemUseCases.simulate(payload) });
const routeSystem = localComposition.createSystemRouter({ readBody, json });
const routeSimulation = localComposition.createSimulationRouter({ readBody, json });

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const path = url.pathname;
    if (await routeSystem({ req, res, path })) return;
    if (await routeYears({ req, res, path })) return;

    if (await routeExecutionLogs({ req, res, path, url })) return;
    if (await routeSettings({ req, res, path })) return;
    if (await routeIncomes({ req, res, path, url })) return;
    if (await routeTaxParameters({ req, res, path, url })) return;
    if (await routeTaxRuleSources({ req, res, path, url })) return;

    // -----------------------------------------------------------------------
    // Fee receipts (boletas) y gastos de honorarios
    // -----------------------------------------------------------------------
    if (await routeFeeReceipts({ req, res, path, url })) return;
    if (await routeFeeExpenseSettings({ req, res, path })) return;

    // -----------------------------------------------------------------------
    // Mortgages
    // -----------------------------------------------------------------------
    if (await routeMortgages({ req, res, path, url })) return;

    if (await routeSimulation({ req, res, path })) return;
    if (await routeSnapshots({ req, res, path })) return;
    if (path.startsWith('/api/')) return apiError(res, 404, 'not_found', 'Ruta no encontrada');
    return serveStatic(req, res);
  } catch (error) {
    if (error instanceof ApiValidationError) return apiError(res, 400, error.code, error.message, error.fieldErrors);
    if (error instanceof ValidationError) return apiError(res, 400, error.code, error.message, error.fieldErrors);
    console.error(error);
    return apiError(res, 400, 'unexpected', error instanceof Error ? error.message : 'Error inesperado');
  }
});

export function startServer({ port = configuredPort } = {}) {
  return new Promise((resolve, reject) => {
    const onError = error => {
      server.off('listening', onListening);
      reject(error);
    };
    const onListening = () => {
      server.off('error', onError);
      console.log(`API disponible en http://localhost:${port}`);
      resolve(server);
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port);
  });
}

export function stopServer() {
  return new Promise((resolve, reject) => {
    if (!server.listening) {
      resolve();
      return;
    }
    server.close(error => error ? reject(error) : resolve());
  });
}

const isMain = process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url;
if (isMain) await startServer();
