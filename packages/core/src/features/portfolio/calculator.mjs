import { afpCommissionRates, defaultSettings } from '../../shared/defaults.mjs';
import { round2, clamp } from '../../shared/util.mjs';
import { computeAcceptedFeeExpense, consolidateFeeReceipts, computeFeeReceiptAmounts } from '../fees/fee-calculator.mjs';
import { computeArticle55BisBenefit } from '../mortgages/mortgage-calculator.mjs';
import { TAX_PARAMETER_KEYS } from '../taxation/tax-parameters.mjs';
import { annualBrackets, taxFromTaxableIncome } from '../taxation/brackets.mjs';
import { normalizeSalary, annualAmount, monthlySalaryFromGross } from '../income/salary.mjs';
import { calculationInput, calculationResult, calculationStep, explained, numeric } from '../../shared/calculation-explanation.mjs';
// Year-aware params loader. When the caller passes `params` we use it; otherwise we
// fall back to defaults so the calculator keeps being usable standalone (e.g.
// inside unit tests that import createDefaultSettings directly).
function resolveParams(settings, params) {
  const merged = {
    [TAX_PARAMETER_KEYS.FEE_WITHHOLDING_RATE]: Number(settings.honorariosRetentionRate),
    [TAX_PARAMETER_KEYS.FEE_PRESUMED_EXPENSE_RATE]: Number(settings.honorariosPresumedExpenseRate),
    [TAX_PARAMETER_KEYS.FEE_PRESUMED_EXPENSE_MAX_UTA]: Number(settings.honorariosPresumedExpenseCapUta),
    [TAX_PARAMETER_KEYS.MORTGAGE_INTEREST_MAX_UTA]: Number(settings.mortgageInterestMaxUta),
    [TAX_PARAMETER_KEYS.MORTGAGE_FULL_BENEFIT_INCOME_MAX_UTA]: Number(settings.mortgageFullBenefitIncomeMaxUta),
    [TAX_PARAMETER_KEYS.MORTGAGE_PARTIAL_BENEFIT_INCOME_MAX_UTA]: Number(settings.mortgagePartialBenefitIncomeMaxUta),
    [TAX_PARAMETER_KEYS.MORTGAGE_PARTIAL_FORMULA_CONSTANT]: Number(settings.mortgagePartialFormulaConstant),
    [TAX_PARAMETER_KEYS.MORTGAGE_PARTIAL_FORMULA_FACTOR]: Number(settings.mortgagePartialFormulaFactor)
  };
  return { ...merged, ...(params || {}) };
}

// Simulate the annual portfolio. Optional `modules` argument allows new modules to
// be injected without breaking existing callers:
//   simulatePortfolio(sources, settings, extraApv)
//   simulatePortfolio(sources, settings, extraApv, { feeReceipts, mortgages, annualRecords, params })
export function simulatePortfolio(sources = [], settingsInput = {}, extraApv = { annualAmount: 0, regime: 'NONE' }, modules = {}) {
  const settings = { ...defaultSettings, ...settingsInput };
  const utaValue = settings.utmValue * 12;
  const params = resolveParams(settings, modules.params);
  const active = sources.filter(source => source.active !== false);
  const salaries = active.filter(source => source.kind === 'SALARY').map(source => normalizeSalary(source, settings));
  const others = active.filter(source => source.kind === 'BONUS' || source.kind === 'OTHER');

  // STEP 1. Consolidate salaries.
  let salaryTaxable = 0;
  let salaryGross = 0;
  let salaryNet = 0;
  let salaryWithheld = 0;
  let mandatoryPension = 0;
  let afpCommissions = 0;
  let health = 0;
  let afc = 0;
  let apvA = 0;
  let apvBPayroll = 0;
  let apvBDirect = 0;

  const salaryBreakdown = salaries.map(source => {
    const monthly = monthlySalaryFromGross(source, settings);
    const months = clamp(Number(source.months) || 12, 1, 12);
    salaryGross += monthly.gross * months;
    salaryNet += monthly.net * months;
    salaryTaxable += monthly.taxableBase * months;
    salaryWithheld += monthly.taxWithheld * months;
    mandatoryPension += monthly.pension * months;
    afpCommissions += monthly.afpCommission * months;
    health += monthly.healthCash * months;
    afc += monthly.afc * months;
    const annualApv = monthly.apvCash * months;
    if (source.apvRegime === 'A') apvA += annualApv;
    if (source.apvRegime === 'B' && source.apvPaymentMethod === 'PAYROLL') apvBPayroll += annualApv;
    if (source.apvRegime === 'B' && source.apvPaymentMethod === 'DIRECT') apvBDirect += annualApv;
    return { id: source.id, name: source.name, months, enteredAmount: source.enteredAmount, inputMode: source.inputMode, ...monthly };
  });

  // STEP 2. Consolidate honorarios. Use new module when feeReceipts provided;
  // otherwise fall back to legacy HONORARIA-based calculation for back-compat.
  let honorariosGross = 0;
  let honorariosWithheld = 0; // retentions by third parties (clients)
  let honorariosPPM = 0;     // PPM paid by the issuer
  let honorariosNetReceived = 0;
  let honorariosTaxable = 0;
  let honorariosExpense = 0;
  let honorariosExpenseMode = settings.honorariosExpenseMethod === 'ACTUAL' ? 'ACTUAL' : 'PRESUMED';
  let feeSummary = null;

  const legacyHonorarios = active.filter(source => source.kind === 'HONORARIA');

  if (Array.isArray(modules.feeReceipts) && modules.feeReceipts.length > 0) {
    // New canonical flow: per-receipt calculation with the versioned table.
    const recompute = modules.feeReceipts.map(r => {
      const c = computeFeeReceiptAmounts(r, params);
      return { ...r, ...c };
    });
    feeSummary = consolidateFeeReceipts(recompute, settings, params);
    honorariosGross = feeSummary.recognizedGrossForTax;
    honorariosWithheld = feeSummary.recognizedWithheldForTax;
    honorariosPPM = feeSummary.recognizedPPMForTax;
    honorariosNetReceived = feeSummary.recognizedNetForTax;
  } else {
    honorariosGross = legacyHonorarios.reduce((sum, source) => sum + annualAmount(source), 0);
    honorariosWithheld = legacyHonorarios.reduce((sum, source) => {
      const rate = Number(source.withholdingRate ?? settings.honorariosRetentionRate);
      return sum + annualAmount(source) * rate;
    }, 0);
    honorariosNetReceived = honorariosGross - honorariosWithheld;
  }

  // STEP: fee expense accepted. For ACTUAL mode, clamp expenses to gross.
  const expense = computeAcceptedFeeExpense(honorariosGross, settings, params);
  honorariosExpense = expense.acceptedExpense;
  honorariosExpenseMode = expense.mode;
  honorariosTaxable = Math.max(0, honorariosGross - honorariosExpense);

  // STEP 3. Add other taxable income.
  let otherGross = 0;
  let otherTaxable = 0;
  let otherWithheld = 0;
  let otherNetReceived = 0;
  for (const source of others) {
    const total = annualAmount(source);
    otherGross += total;
    if (source.taxable !== false) otherTaxable += total;
    const retained = total * (Number(source.withholdingRate) || 0);
    otherWithheld += retained;
    otherNetReceived += total - retained;
  }

  // APV B cap and accounting (legacy semantics). The salary loop above deferred
  // the rejected-payroll-B accounting; here we consolidate.
  const additionalApv = Math.max(0, Number(extraApv.annualAmount) || 0);
  if (extraApv.regime === 'A') apvA += additionalApv;
  if (extraApv.regime === 'B') apvBDirect += additionalApv;

  const apvBAnnualCap = settings.apvBAnnualCapUf * settings.ufValue;
  const totalApvBBeforeCap = apvBPayroll + apvBDirect;
  const acceptedApvB = Math.min(totalApvBBeforeCap, apvBAnnualCap);
  const acceptedPayrollB = Math.min(apvBPayroll, acceptedApvB);
  const acceptedDirectB = Math.max(0, acceptedApvB - acceptedPayrollB);
  const rejectedApvB = Math.max(0, totalApvBBeforeCap - acceptedApvB);
  const rejectedPayrollB = Math.max(0, apvBPayroll - acceptedPayrollB);

  // STEP 4. Determine the gross taxable income (before rebajas).
  // For the article 55 bis bracket determination we use the gross taxable income
  // BEFORE applying the mortgage deduction. This is consistent with the official
  // instruction of the SII: the percentage is a function of the renta bruta
  // imponible anual expressed in UTA, NOT of the post-deduction base.
  // Rejected payroll B was withheld monthly but rejected for annual purposes, so
  // we add it back to the base.
  const grossTaxableIncome = salaryTaxable + rejectedPayrollB + honorariosTaxable + otherTaxable;

  // STEP 5. Compute article 55 bis deduction using the gross taxable income as
  // bracket anchor. The deduction is rebaja de base imponible only.
  let mortgageDeduction = 0;
  let mortgageSummary = null;
  if (Array.isArray(modules.mortgages) && modules.mortgages.length > 0) {
    mortgageSummary = computeArticle55BisBenefit(
      modules.mortgages,
      modules.annualRecords || [],
      { incomeEstimate: grossTaxableIncome, utaValue },
      params
    );
    mortgageDeduction = mortgageSummary.deduction;
  }

  // STEP 6 and 7. Apply APV B and 55 bis as base imponible rebajas in order:
  //   base imponible = gross_taxable - mortgage_deduction - accepted_direct_B
  // rejectedPayrollB was already added back to gross_taxable (see above) since it was
  // already deducted by the employer monthly but rejected for the annual tax.
  const taxableIncome = Math.max(0, grossTaxableIncome - mortgageDeduction - acceptedDirectB);

  // STEP 8. Annual tax estimate (Global Complementario) over the final base.
  const annualTax = taxFromTaxableIncome(taxableIncome, utaValue);

  // STEP 9 and 10. Retentions and credits applied.
  const honorariosTotalRetentions = honorariosWithheld + honorariosPPM;
  const totalWithheld = salaryWithheld + honorariosTotalRetentions + otherWithheld;

  // STEP 11. Estimated balance.
  const balance = annualTax - totalWithheld;
  const apvABonus = Math.min(apvA * settings.apvABonusRate, settings.apvABonusCapUtm * settings.utmValue);

  // STEP: net cash received (informational only).
  const estimatedCashReceived = salaryNet + honorariosNetReceived + otherNetReceived;

  // Real tax saving from the 55 bis deduction: compare annual tax with and without
  // the deduction. We only recompute when there is a meaningful deduction to avoid
  // spurious floating-point zeroes.
  let mortgageTaxSaving = 0;
  if (mortgageDeduction > 0) {
    const altTaxableIncome = Math.max(0, grossTaxableIncome - acceptedDirectB);
    const altAnnualTax = taxFromTaxableIncome(altTaxableIncome, utaValue);
    mortgageTaxSaving = round2(Math.max(0, altAnnualTax - annualTax));
  }

  // Consolidated annual result. This is the single source of truth for the UI:
  // the summary (resumen) and the detailed simulation must both read from here so
  // they can never diverge for the same input data.
  //
  // APV accounting (Caso B): the monthly taxable base already nets out the payroll
  // APV, therefore `salaryTaxable` (and so `grossTaxableIncome`) is expressed AFTER
  // the payroll APV. The annual engine must NOT subtract it again. Only the direct
  // APV B is deducted at annual level. The payroll contribution is reported here so
  // the resumen can show it explicitly without applying it twice.
  const annualResult = {
    totalTaxableIncome: round2(grossTaxableIncome),
    payrollApvContribution: round2(acceptedPayrollB),
    directApvContribution: round2(acceptedDirectB),
    totalApvRegimeBContribution: round2(acceptedPayrollB + acceptedDirectB),
    finalTaxableBase: round2(taxableIncome),
    estimatedAnnualTax: round2(annualTax),
    totalWithholdings: round2(totalWithheld),
    estimatedBalance: round2(balance)
  };

  const generatedAt = new Date().toISOString();
  const ruleVersion = String(settings.ruleVersion || `${settings.year}-configured`);
  const sourceRefs = ['tax_rule_sources:income-tax', 'tax_rule_sources:previsional-contributions'];
  const explanations = buildExplanations({
    settings, generatedAt, ruleVersion, sourceRefs, salaryGross, salaryTaxable, salaryNet, salaryWithheld,
    mandatoryPension, afpCommissions, health, afc, honorariosGross, honorariosExpense,
    honorariosTaxable, honorariosWithheld, honorariosPPM, grossTaxableIncome, mortgageDeduction,
    mortgageTaxSaving, acceptedDirectB, acceptedPayrollB, annualTax, totalWithheld, balance,
    estimatedCashReceived, apvA, apvABonus, rejectedApvB, taxableIncome, annualBrackets, otherGross,
    feeSummary, mortgageSummary, sources: active, extraApv
  });

  return {
    annualResult,
    settings: { ...settings, utaValue },
    totals: {
      grossIncome: round2(salaryGross + honorariosGross + otherGross),
      estimatedCashReceived: round2(estimatedCashReceived),
      grossTaxableIncome: round2(grossTaxableIncome),
      taxableIncome: round2(taxableIncome),
      annualTax: round2(annualTax),
      totalWithheld: round2(totalWithheld),
      estimatedBalance: round2(balance),
      mandatoryPension: round2(mandatoryPension),
      afpCommissions: round2(afpCommissions),
      health: round2(health),
      afc: round2(afc),
      honorariosExpense: round2(honorariosExpense),
      honorariosExpenseMode,
      honorariosWithheld: round2(honorariosWithheld),
      honorariosPPM: round2(honorariosPPM),
      mortgageDeduction: round2(mortgageDeduction),
      mortgageTaxSaving: round2(mortgageTaxSaving),
      apvAContributions: round2(apvA),
      apvABonus: round2(apvABonus),
      apvBAccepted: round2(acceptedApvB),
      apvBRejectedOverCap: round2(rejectedApvB),
      payrollApvContribution: round2(acceptedPayrollB),
      directApvContribution: round2(acceptedDirectB),
      totalApvRegimeBContribution: round2(acceptedPayrollB + acceptedDirectB)
    },
    components: {
      salaryGross: round2(salaryGross),
      salaryTaxable: round2(salaryTaxable),
      salaryWithheld: round2(salaryWithheld),
      honorariosGross: round2(honorariosGross),
      honorariosTaxable: round2(honorariosTaxable),
      honorariosWithheld: round2(honorariosWithheld),
      honorariosPPM: round2(honorariosPPM),
      otherGross: round2(otherGross),
      otherTaxable: round2(otherTaxable),
      otherWithheld: round2(otherWithheld),
      acceptedDirectB: round2(acceptedDirectB),
      acceptedPayrollB: round2(acceptedPayrollB),
      rejectedPayrollB: round2(rejectedPayrollB)
    },
    salaryBreakdown,
    feeSummary,
    mortgageSummary,
    warnings: buildWarnings(settings, active, rejectedApvB, modules, mortgageSummary, feeSummary),
    explanations,
    audit: { generatedAt, taxYear: Number(settings.year), ruleVersion }
  };
}

function buildExplanations(data) {
  const {
    settings, generatedAt, ruleVersion, sourceRefs, salaryGross, salaryTaxable, salaryNet, salaryWithheld,
    mandatoryPension, afpCommissions, health, afc, honorariosGross, honorariosExpense,
    honorariosTaxable, honorariosWithheld, honorariosPPM, grossTaxableIncome, mortgageDeduction,
    mortgageTaxSaving, acceptedDirectB, acceptedPayrollB, annualTax, totalWithheld, balance,
    estimatedCashReceived, apvA, apvABonus, rejectedApvB, taxableIncome, annualBrackets, otherGross,
    feeSummary, mortgageSummary, sources, extraApv
  } = data;
  const clp = value => numeric(value);
  const common = { taxYear: Number(settings.year), ruleVersion, generatedAt, sourceRefs, rounding: { method: 'ROUND', decimals: 2, stage: 'EACH_STEP', description: 'Los importes monetarios se redondean a dos decimales en cada resultado del motor.' } };
  const items = [
    explained('income.gross.total', 'Ingreso bruto total', 'Suma los ingresos brutos de las fuentes activas antes de descuentos.', { ...common, formulaLabel: 'Ingresos brutos consolidados', formulaExpression: 'sueldo bruto + honorarios brutos + otros ingresos', appliedExpression: `${clp(salaryGross)} + ${clp(honorariosGross)} + ${clp(otherGross)} = ${clp(salaryGross + honorariosGross + otherGross)}`, inputs: [calculationInput('salaryGross', 'Sueldos brutos', clp(salaryGross), 'DERIVED'), calculationInput('honorariosGross', 'Honorarios brutos', clp(honorariosGross), feeSummary ? 'DERIVED' : 'USER_INPUT'), calculationInput('otherGross', 'Otros ingresos', clp(otherGross), 'DERIVED')], steps: [calculationStep(1, 'Consolidación de fuentes', 'sueldo + honorarios + otros', `${clp(salaryGross)} + ${clp(honorariosGross)} + ${clp(otherGross)}`, clp(salaryGross + honorariosGross + otherGross))], result: calculationResult('Ingreso bruto total', clp(salaryGross + honorariosGross + otherGross), 'CLP', 'Monto nominal anual antes de descuentos.') }),
    explained('income.net.total', 'Ingreso líquido total', 'Suma el efectivo estimado recibido después de descuentos y retenciones.', { ...common, formulaLabel: 'Caja recibida', formulaExpression: 'sueldos líquidos + honorarios líquidos + otros líquidos', appliedExpression: `${clp(salaryNet)} + honorarios líquidos + otros líquidos`, inputs: [calculationInput('salaryNet', 'Sueldos líquidos', clp(salaryNet), 'DERIVED'), calculationInput('feeNet', 'Honorarios líquidos', feeSummary?.recognizedNetForTax ?? null, feeSummary ? 'DERIVED' : 'SYSTEM_DEFAULT')], result: calculationResult('Ingreso líquido total', clp(estimatedCashReceived), 'CLP') }),
    explained('prevision.contributions', 'Cotizaciones previsionales', 'Agrupa AFP obligatoria, comisión, salud y seguro de cesantía descontados en el año.', { ...common, formulaLabel: 'Cotizaciones del período', formulaExpression: 'AFP obligatoria + comisión AFP + salud + seguro de cesantía', appliedExpression: `${clp(mandatoryPension)} + ${clp(afpCommissions)} + ${clp(health)} + ${clp(afc)} = ${clp(mandatoryPension + afpCommissions + health + afc)}`, inputs: [calculationInput('mandatoryPension', 'AFP obligatoria', clp(mandatoryPension), 'DERIVED'), calculationInput('afpCommissions', 'Comisión AFP', clp(afpCommissions), 'TAX_CONFIGURATION'), calculationInput('health', 'Salud', clp(health), 'DERIVED'), calculationInput('afc', 'Seguro de cesantía', clp(afc), 'TAX_CONFIGURATION')], result: calculationResult('Cotizaciones previsionales', clp(mandatoryPension + afpCommissions + health + afc), 'CLP') }),
    explained('fees.withholding', 'Retenciones y PPM', 'Son pagos anticipados que se comparan contra el impuesto anual estimado.', { ...common, formulaLabel: 'Pagos anticipados', formulaExpression: 'IUSC + retenciones de honorarios + PPM', appliedExpression: `${clp(salaryWithheld)} + ${clp(honorariosWithheld)} + ${clp(honorariosPPM)} + otros = ${clp(totalWithheld)}`, inputs: [calculationInput('salaryWithheld', 'Retención de empleadores', clp(salaryWithheld), 'DERIVED'), calculationInput('honorariosWithheld', 'Retención de honorarios', clp(honorariosWithheld), 'DERIVED'), calculationInput('honorariosPPM', 'PPM', clp(honorariosPPM), 'DERIVED')], result: calculationResult('Retenciones y PPM acumulados', clp(totalWithheld), 'CLP', 'No equivalen necesariamente al impuesto anual definitivo.') }),
    explained('taxable.consolidated', 'Renta tributable consolidada', 'Consolida las rentas afectas después de cotizaciones y gastos aceptados.', { ...common, formulaLabel: 'Renta antes de rebajas', formulaExpression: 'renta laboral + renta neta de honorarios + otros ingresos afectos', appliedExpression: `${clp(salaryTaxable)} + ${clp(honorariosTaxable)} + otros = ${clp(grossTaxableIncome)}`, inputs: [calculationInput('salaryTaxable', 'Renta laboral tributable', clp(salaryTaxable), 'DERIVED'), calculationInput('honorariosTaxable', 'Renta neta de honorarios', clp(honorariosTaxable), 'DERIVED'), calculationInput('feeExpense', 'Gastos aceptados', clp(honorariosExpense), 'TAX_CONFIGURATION')], steps: [calculationStep(1, 'Gastos de honorarios', 'honorarios brutos − gastos aceptados', `${clp(honorariosGross)} − ${clp(honorariosExpense)} = ${clp(honorariosTaxable)}`, clp(honorariosTaxable)), calculationStep(2, 'Consolidación', 'renta laboral + honorarios netos + otros', `${clp(salaryTaxable)} + ${clp(honorariosTaxable)} + otros = ${clp(grossTaxableIncome)}`, clp(grossTaxableIncome))], result: calculationResult('Renta tributable consolidada', clp(grossTaxableIncome), 'CLP') }),
    explained('mortgage.deduction', 'Rebaja hipotecaria', 'Solo considera intereses elegibles del artículo 55 bis, no el dividendo completo.', { ...common, formulaLabel: 'Intereses elegibles por porcentaje', formulaExpression: 'min(intereses elegibles, tope UTA) × porcentaje aplicable', appliedExpression: mortgageSummary ? `min(${clp(mortgageSummary.eligibleInterest)}, ${clp(mortgageSummary.capInterest)}) × ${mortgageSummary.applicablePercentage}% = ${clp(mortgageDeduction)}` : 'No calculado: no hay crédito hipotecario informado', inputs: mortgageSummary ? [calculationInput('eligibleInterest', 'Intereses elegibles', clp(mortgageSummary.eligibleInterest), 'USER_INPUT'), calculationInput('capInterest', 'Límite de intereses', clp(mortgageSummary.capInterest), 'TAX_CONFIGURATION'), calculationInput('applicablePercentage', 'Porcentaje aplicable', mortgageSummary.applicablePercentage / 100, 'TAX_CONFIGURATION', 'PERCENT')] : [], assumptions: ['Capital amortizado, seguros y otros cargos no son intereses deducibles.'], warnings: mortgageSummary?.warnings?.map(item => item.message) || ['No se ingresaron intereses elegibles.'], result: calculationResult('Rebaja de base imponible', clp(mortgageDeduction), 'CLP') }),
    explained('apv.regime-a', 'APV Régimen A', 'Entrega una bonificación estatal calculada sobre el aporte, con el tope configurado.', { ...common, formulaLabel: 'Bonificación Régimen A', formulaExpression: 'min(aporte anual × tasa, tope UTM)', appliedExpression: `min(${clp(apvA)} × ${Number(settings.apvABonusRate) * 100}%, ${clp(Number(settings.apvABonusCapUtm) * Number(settings.utmValue))}) = ${clp(apvABonus)}`, inputs: [calculationInput('annualContribution', 'Aporte anual Régimen A', clp(apvA), 'USER_INPUT'), calculationInput('bonusRate', 'Tasa de bonificación', Number(settings.apvABonusRate), 'TAX_CONFIGURATION', 'PERCENT'), calculationInput('bonusCap', 'Tope de bonificación', clp(Number(settings.apvABonusCapUtm) * Number(settings.utmValue)), 'TAX_CONFIGURATION')], result: calculationResult('Bonificación Régimen A', clp(apvABonus), 'CLP') }),
    explained('apv.regime-b', 'APV Régimen B', 'Reduce la base imponible y su beneficio se obtiene recalculando el impuesto progresivo.', { ...common, formulaLabel: 'Rebaja por APV B', formulaExpression: 'base antes − aporte B aceptado = base después', appliedExpression: `${clp(grossTaxableIncome - mortgageDeduction)} − ${clp(acceptedDirectB)} = ${clp(taxableIncome)}`, inputs: [calculationInput('baseBefore', 'Base antes del APV B', clp(grossTaxableIncome - mortgageDeduction), 'DERIVED'), calculationInput('acceptedDirectB', 'APV B directo aceptado', clp(acceptedDirectB), 'USER_INPUT'), calculationInput('rejectedApvB', 'APV B rechazado por tope', clp(rejectedApvB), 'DERIVED')], assumptions: ['El beneficio no se aproxima aplicando una tasa marginal fija; se usa el recálculo completo del impuesto.'], result: calculationResult('APV B aceptado como rebaja', clp(acceptedDirectB), 'CLP') }),
    explained('tax.annual', 'Impuesto anual estimado', 'Aplica la tabla progresiva configurada a la base imponible final.', { ...common, formulaLabel: 'Impuesto progresivo', formulaExpression: 'base imponible × factor del tramo − rebaja del tramo', appliedExpression: `${clp(taxableIncome)} × factor del tramo − rebaja = ${clp(annualTax)}`, inputs: [calculationInput('taxableIncome', 'Base imponible final', clp(taxableIncome), 'DERIVED'), calculationInput('utaValue', 'UTA de referencia', clp(settings.utmValue * 12), 'TAX_CONFIGURATION')], steps: [calculationStep(1, 'Base imponible', 'renta consolidada − rebajas', `${clp(grossTaxableIncome)} − ${clp(mortgageDeduction)} − ${clp(acceptedDirectB)} = ${clp(taxableIncome)}`, clp(taxableIncome)), calculationStep(2, 'Tabla progresiva', 'base × factor − rebaja', `${clp(taxableIncome)} × factor − rebaja = ${clp(annualTax)}`, clp(annualTax))], result: calculationResult('Impuesto anual estimado', clp(annualTax), 'CLP', 'Estimación: depende de los parámetros y supuestos configurados.') }),
    explained('balance.estimated', 'Saldo por pagar o devolver', 'Compara el impuesto anual estimado con las retenciones y PPM acumulados.', { ...common, formulaLabel: 'Saldo anual', formulaExpression: 'impuesto anual − retenciones − PPM', appliedExpression: `${clp(annualTax)} − ${clp(totalWithheld)} = ${clp(balance)}`, inputs: [calculationInput('annualTax', 'Impuesto anual', clp(annualTax), 'DERIVED'), calculationInput('totalWithheld', 'Retenciones y PPM', clp(totalWithheld), 'DERIVED')], result: calculationResult('Saldo estimado', clp(balance), 'CLP', balance > 0 ? 'Saldo estimado por pagar.' : 'Devolución estimada.') }),
    explained('simulation.reconciliation', 'Reconciliación anual', 'Resume el flujo desde los ingresos afectos hasta el saldo final.', { ...common, formulaLabel: 'Conciliación tributaria', formulaExpression: 'ingresos − gastos − rebajas = base; impuesto − pagos anticipados = saldo', appliedExpression: `${clp(grossTaxableIncome)} − ${clp(honorariosExpense)} − ${clp(mortgageDeduction)} − ${clp(acceptedDirectB)} = ${clp(taxableIncome)}; ${clp(annualTax)} − ${clp(totalWithheld)} = ${clp(balance)}`, result: calculationResult('Saldo de la simulación', clp(balance), 'CLP'), warnings: sources.some(source => source.inputMode === 'NET') ? ['Al menos un sueldo fue estimado desde líquido mediante búsqueda binaria.'] : [] })
  ];
  return items;
}

function buildWarnings(settings, sources, rejectedApvB, modules, mortgageSummary, feeSummary) {
  const warnings = [
    'La proyección anual usa la UTM configurada multiplicada por 12. El impuesto definitivo del año comercial 2026 dependerá de la UTM de diciembre de 2026 y de la información oficial del SII.',
    'El simulador no reemplaza la propuesta de declaración del SII ni asesoría tributaria o previsional.'
  ];
  if (sources.some(source => source.kind === 'SALARY' && source.inputMode === 'NET')) {
    warnings.push('Los sueldos ingresados como líquidos se convierten a bruto mediante una búsqueda numérica y pueden diferir de una liquidación real por haberes no imponibles, descuentos particulares o beneficios del empleador.');
  }
  if (settings.honorariosExpenseMethod === 'PRESUMED') {
    warnings.push('En honorarios se aplica gasto presunto del 30% con tope de 15 UTA; no se modelan todas las cotizaciones previsionales anuales de independientes.');
  }
  if (rejectedApvB > 0) warnings.push('Parte del APV B excede el tope anual configurado y no fue utilizada como rebaja tributaria.');
  if (feeSummary && feeSummary.recognitionMode === 'PAID_ONLY') {
    warnings.push('Las boletas pendientes de pago no se incluyeron en la consolidación tributaria.');
  }
  if (feeSummary && feeSummary.recognitionMode === 'ISSUE_DATE') {
    warnings.push('Las boletas se reconocieron por fecha de emisión; el tratamiento definitivo debe contrastarse con los certificados del SII.');
  }
  if (mortgageSummary) {
    if (mortgageSummary.rejectedInterestOverCap > 0) {
      warnings.push(`El monto de intereses elegibles excede el tope de ${mortgageSummary.formula.maxInterestUta} UTA; ${mortgageSummary.rejectedInterestOverCap} se descartan.`);
    }
    if (mortgageSummary.excluded?.length > 0) {
      warnings.push(`${mortgageSummary.excluded.length} crédito(s) hipotecario(s) no elegible(s) para el artículo 55 bis; revise el detalle.`);
    }
    warnings.push('El beneficio del artículo 55 bis se calcula solo sobre intereses. Capital, seguros, gastos comunes y comisiones no son deducibles.');
    if (mortgageSummary.bracket === 'PARTIAL') {
      warnings.push(`Tu renta imponible proyectada (${mortgageSummary.incomeUta.toFixed(2)} UTA) reduce el porcentaje de rebaja a ${mortgageSummary.applicablePercentage}%.`);
    } else if (mortgageSummary.bracket === 'EXCLUDED') {
      warnings.push('Tu renta imponible proyectada supera 150 UTA; el artículo 55 bis no genera rebaja.');
    }
    warnings.push('El certificado anual de intereses emitido por la institución financiera es la fuente preferida del monto deducible.');
  }
  return warnings;
}
