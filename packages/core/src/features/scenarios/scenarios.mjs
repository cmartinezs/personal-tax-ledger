import { round2 } from '../../shared/util.mjs';
import { simulatePortfolio } from '../portfolio/calculator.mjs';

// Build the comparative scenarios list described in section 4 of the assignment.
// Each scenario reuses the same engine with the corresponding optional modules off/on.
export function buildScenarios(sources, settings, modules) {
  const baseModules = {
    feeReceipts: [],
    mortgages: [],
    annualRecords: [],
    ...(modules || {})
  };
  const annualAPV = Number(settings.scenarioApvAnnual) || 0;
  const apvAMonthly = 250_000;
  const apvAAnnualDefault = apvAMonthly * 12;
  const compareApvAnnual = annualAPV || apvAAnnualDefault;

  // Reset APV-related input sources so the scenarios are explicit.
  const sourcesNoApv = sources.map(s => ({ ...s, apvRegime: 'NONE', apvMonthly: 0 }));
  const sourcesNoMortgage = sourcesNoApv;

  const run = (extra, mods) => simulatePortfolio(sourcesNoMortgage, settings, extra, mods);

  const base = run({ annualAmount: 0, regime: 'NONE' }, { feeReceipts: baseModules.feeReceipts, mortgages: [], annualRecords: [] });
  const onlyMortgage = run({ annualAmount: 0, regime: 'NONE' }, { feeReceipts: baseModules.feeReceipts, mortgages: baseModules.mortgages, annualRecords: baseModules.annualRecords });
  const mortgageAndApvA = run({ annualAmount: compareApvAnnual, regime: 'A' }, { feeReceipts: baseModules.feeReceipts, mortgages: baseModules.mortgages, annualRecords: baseModules.annualRecords });
  const mortgageAndApvB = run({ annualAmount: compareApvAnnual, regime: 'B' }, { feeReceipts: baseModules.feeReceipts, mortgages: baseModules.mortgages, annualRecords: baseModules.annualRecords });

  // Boletas con retención versus boletas sin retencion: split the receipt pool.
  const retained = (baseModules.feeReceipts || []).filter(r => r.withholdingMode === 'WITHHELD_BY_RECIPIENT');
  const noRetention = (baseModules.feeReceipts || []).filter(r => r.withholdingMode === 'NO_WITHHOLDING' || r.withholdingMode === 'PPM_PAID_BY_ISSUER');

  const boletasWith = run({ annualAmount: 0, regime: 'NONE' }, { feeReceipts: retained, mortgages: [], annualRecords: [] });
  const boletasWithout = run({ annualAmount: 0, regime: 'NONE' }, { feeReceipts: noRetention, mortgages: [], annualRecords: [] });

  // Gastos presuntos vs efectivos.
  const presumedSettings = { ...settings, honorariosExpenseMethod: 'PRESUMED' };
  const actualSettings = { ...settings, honorariosExpenseMethod: 'ACTUAL' };
  const expensesPresumed = simulatePortfolio(sourcesNoMortgage, presumedSettings, { annualAmount: 0, regime: 'NONE' }, { feeReceipts: baseModules.feeReceipts, mortgages: [], annualRecords: [] });
  const expensesActual = simulatePortfolio(sourcesNoMortgage, actualSettings, { annualAmount: 0, regime: 'NONE' }, { feeReceipts: baseModules.feeReceipts, mortgages: [], annualRecords: [] });

  // Different APV monthly contributions.
  const apvMonthlyScenarios = [100_000, 250_000, 500_000, 750_000].map(monthly => simulatePortfolio(sourcesNoMortgage, settings, { annualAmount: monthly * 12, regime: 'B' }, { feeReceipts: baseModules.feeReceipts, mortgages: baseModules.mortgages, annualRecords: baseModules.annualRecords }));

  return [
    { key: 'base', label: 'Sin hipotecario y sin APV', result: base, liquidityCommitted: 0, accumulatedPensionSaving: 0 },
    { key: 'mortgage', label: 'Solo beneficio hipotecario', result: onlyMortgage, liquidityCommitted: 0, accumulatedPensionSaving: 0 },
    { key: 'mortgage_apv_a', label: 'Hipotecario + APV Régimen A', result: mortgageAndApvA, liquidityCommitted: compareApvAnnual, accumulatedPensionSaving: compareApvAnnual },
    { key: 'mortgage_apv_b', label: 'Hipotecario + APV Régimen B', result: mortgageAndApvB, liquidityCommitted: compareApvAnnual, accumulatedPensionSaving: compareApvAnnual },
    { key: 'fee_with_retention', label: 'Boletas con retención por terceros', result: boletasWith, liquidityCommitted: 0, accumulatedPensionSaving: 0 },
    { key: 'fee_without_retention', label: 'Boletas con PPM / sin retención', result: boletasWithout, liquidityCommitted: 0, accumulatedPensionSaving: 0 },
    { key: 'fee_expense_presumed', label: 'Gastos presuntos de honorarios', result: expensesPresumed, liquidityCommitted: 0, accumulatedPensionSaving: 0 },
    { key: 'fee_expense_actual', label: 'Gastos efectivos de honorarios', result: expensesActual, liquidityCommitted: 0, accumulatedPensionSaving: 0 },
    ...apvMonthlyScenarios.map((r, i) => ({
      key: `apv_monthly_${i}`,
      label: `APV B con ${[100_000, 250_000, 500_000, 750_000][i].toLocaleString('es-CL')} mensual`,
      result: r,
      liquidityCommitted: [100_000, 250_000, 500_000, 750_000][i] * 12,
      accumulatedPensionSaving: [100_000, 250_000, 500_000, 750_000][i] * 12
    }))
  ].map(s => ({
    ...s,
    diff: round2(s.result.totals.estimatedBalance - base.totals.estimatedBalance)
  }));
}
