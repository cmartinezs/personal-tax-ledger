import { incomeSourceRequest } from '@personal-tax-ledger/api-contracts';
import { ApiValidationError, apiError, json, readJsonBody } from '@personal-tax-ledger/http-api';
import { ValidationError } from '../../../../server/lib/util.mjs';
import { serveStatic } from './serve-static.mjs';

function queryYear(url, fallbackYear) {
  const year = url.searchParams.get('taxYear');
  if (year == null || year === '') return fallbackYear;
  return Number(year);
}

export function createHttpRouter({ composition, webDist }) {
  const context = composition.context;
  const getSettings = () => composition.settingsUseCases.getSettings(context);
  const validateSource = async body => {
    const allowedKinds = new Set(['SALARY', 'HONORARIA', 'BONUS', 'OTHER']);
    if (!body.name || typeof body.name !== 'string') throw new ApiValidationError('invalid_name', 'El nombre es obligatorio', { name: 'obligatorio' });
    if (!allowedKinds.has(body.kind)) throw new ApiValidationError('invalid_kind', 'Tipo de ingreso inválido', { kind: 'invalido' });
    if (!Number.isFinite(Number(body.amount)) || Number(body.amount) < 0) throw new ApiValidationError('invalid_amount', 'Monto inválido', { amount: 'invalido' });
    const normalized = incomeSourceRequest(body);
    const settings = await getSettings();
    return {
      ...normalized,
      withholdingRate: normalized.kind === 'HONORARIA' && !(normalized.withholdingRate > 0)
        ? Number(settings.honorariosRetentionRate)
        : normalized.withholdingRate,
      taxYear: normalized.taxYear || settings.year
    };
  };

  const routeIncomes = composition.createIncomeRouter({ getSettings, queryYear, readBody: readJsonBody, json, apiError, validateSource });
  const routeSettings = composition.createSettingsRouter({ readBody: readJsonBody, json });
  const routeExecutionLogs = composition.createExecutionLogRouter({ readBody: readJsonBody, json, apiError });
  const routeFeeReceipts = composition.createFeeReceiptRouter({ readBody: readJsonBody, json, apiError });
  const routeFeeExpenseSettings = composition.createFeeExpenseSettingsRouter({ readBody: readJsonBody, json, apiError });
  const routeMortgages = composition.createMortgageRouter({ readBody: readJsonBody, json, apiError });
  const routeTaxParameters = composition.createTaxParameterRouter({ readBody: readJsonBody, json, apiError, queryYear });
  const routeTaxRuleSources = composition.createTaxRuleSourceRouter({ readBody: readJsonBody, json, apiError });
  const routeYears = composition.createYearRouter({ json });
  const routeSnapshots = composition.createSnapshotRouter({ readBody: readJsonBody, json, simulate: payload => composition.systemUseCases.simulate(payload) });
  const routeSystem = composition.createSystemRouter({ readBody: readJsonBody, json });
  const routeSimulation = composition.createSimulationRouter({ readBody: readJsonBody, json });

  return async function routeRequest(req, res) {
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
      if (await routeFeeReceipts({ req, res, path, url })) return;
      if (await routeFeeExpenseSettings({ req, res, path })) return;
      if (await routeMortgages({ req, res, path, url })) return;
      if (await routeSimulation({ req, res, path })) return;
      if (await routeSnapshots({ req, res, path })) return;
      if (path.startsWith('/api/')) return apiError(res, 404, 'not_found', 'Ruta no encontrada');
      return serveStatic(req, res, webDist);
    } catch (error) {
      if (error instanceof ApiValidationError) return apiError(res, 400, error.code, error.message, error.fieldErrors);
      if (error instanceof ValidationError) return apiError(res, 400, error.code, error.message, error.fieldErrors);
      console.error(error);
      return apiError(res, 400, 'unexpected', error instanceof Error ? error.message : 'Error inesperado');
    }
  };
}
