import { assertWorkspaceContext } from '@personal-tax-ledger/contracts';

export function createSystemUseCases({
  context,
  settingsUseCases,
  incomeUseCases,
  referenceUseCases,
  yearUseCases,
  taxParameterUseCases,
  simulatePortfolio,
  compareApv,
  buildScenarios,
  computeArticle55BisBenefit,
  computeFeeReceiptAmounts,
  defaultSettings
}) {
  assertWorkspaceContext(context);
  return {
    async health() {
      const settings = await settingsUseCases.getSettings(context);
      return { status: 'ok', year: settings.year };
    },
    async bootstrap() {
      const settings = await settingsUseCases.getSettings(context);
      const [sources, references] = await Promise.all([
        incomeUseCases.listIncomeSources(context, settings.year),
        referenceUseCases.listReferences()
      ]);
      return { settings, sources, references };
    },
    async listYears() {
      return yearUseCases.listYears();
    },
    async simulate(payload = {}) {
      const baseSettings = await settingsUseCases.getSettings(context);
      const settings = { ...baseSettings, ...(payload.settings || {}) };
      const sources = payload.sources || await incomeUseCases.listIncomeSources(context, baseSettings.year);
      return simulatePortfolio(sources, settings, payload.extraApv, {
        feeReceipts: payload.feeReceipts,
        mortgages: payload.mortgages,
        annualRecords: payload.annualRecords
      });
    },
    async compareApv(payload = {}) {
      const baseSettings = await settingsUseCases.getSettings(context);
      const settings = { ...baseSettings, ...(payload.settings || {}) };
      const sources = payload.sources || await incomeUseCases.listIncomeSources(context, baseSettings.year);
      return compareApv(sources, settings, payload.annualContribution, {
        feeReceipts: payload.feeReceipts,
        mortgages: payload.mortgages,
        annualRecords: payload.annualRecords
      });
    },
    async scenarios(payload = {}) {
      const baseSettings = await settingsUseCases.getSettings(context);
      const settings = { ...baseSettings, ...(payload.settings || {}) };
      const sources = payload.sources || await incomeUseCases.listIncomeSources(context, baseSettings.year);
      return buildScenarios(sources, settings, {
        feeReceipts: payload.feeReceipts,
        mortgages: payload.mortgages,
        annualRecords: payload.annualRecords
      });
    },
    async article55Bis(payload = {}) {
      const baseSettings = await settingsUseCases.getSettings(context);
      const settings = { ...baseSettings, ...(payload.settings || {}) };
      const year = Number(settings.year) || defaultSettings.year;
      const parameters = payload.params || Object.fromEntries((await taxParameterUseCases.listTaxParameters(null, year)).map(item => [item.ruleKey, item.value]));
      return computeArticle55BisBenefit(payload.mortgages || [], payload.annualRecords || [], {
        incomeEstimate: Number(payload.incomeEstimate) || 0,
        utaValue: settings.utmValue * 12
      }, parameters);
    },
    async feeReceiptCalculation(payload = {}) {
      const settings = await settingsUseCases.getSettings(context);
      const year = Number(settings.year) || defaultSettings.year;
      const parameters = Object.fromEntries((await taxParameterUseCases.listTaxParameters(null, year)).map(item => [item.ruleKey, item.value]));
      return computeFeeReceiptAmounts(payload.receipt || payload, parameters);
    }
  };
}
