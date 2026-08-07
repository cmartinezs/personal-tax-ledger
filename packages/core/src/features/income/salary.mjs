import { afpCommissionRates, defaultSettings } from '../../shared/defaults.mjs';
import { round2, clamp } from '../../shared/util.mjs';
import { taxFromTaxableIncome } from '../taxation/brackets.mjs';

export function monthlySalaryFromGross(source, settingsInput = {}) {
  const settings = { ...defaultSettings, ...settingsInput };
  const gross = Math.max(0, Number(source.amount) || 0);
  const pensionBase = Math.min(gross, settings.afpCapUf * settings.ufValue);
  const afcBase = Math.min(gross, settings.afcCapUf * settings.ufValue);
  const afpRate = Number(source.afpCommissionRate ?? afpCommissionRates[source.afpName] ?? 0);
  const pension = pensionBase * settings.pensionRate;
  const afpCommission = pensionBase * afpRate;
  const legalHealth = pensionBase * settings.healthRate;
  const healthCash = source.healthSystem === 'ISAPRE'
    ? Math.max(legalHealth, Number(source.healthPlanAmount) || 0)
    : source.healthSystem === 'NONE' ? 0 : legalHealth;
  const afcRate = source.contractType === 'INDEFINITE' ? 0.006 : 0;
  const afc = afcBase * afcRate;
  const apvMonthly = Math.max(0, Number(source.apvMonthly) || 0);
  const apvBCappedMonthly = Math.min(apvMonthly, settings.apvBMonthlyCapUf * settings.ufValue);
  const apvPayrollB = source.apvRegime === 'B' && source.apvPaymentMethod === 'PAYROLL' ? apvBCappedMonthly : 0;
  const apvCash = source.apvRegime === 'NONE' ? 0 : apvMonthly;
  const taxableBase = Math.max(0, gross - pension - afpCommission - legalHealth - afc - apvPayrollB);
  const taxWithheld = taxFromTaxableIncome(taxableBase, settings.utmValue);
  const net = gross - pension - afpCommission - healthCash - afc - apvCash - taxWithheld;

  return {
    gross: round2(gross),
    pension: round2(pension),
    afpCommission: round2(afpCommission),
    legalHealth: round2(legalHealth),
    healthCash: round2(healthCash),
    afc: round2(afc),
    apvCash: round2(apvCash),
    apvPayrollB: round2(apvPayrollB),
    taxableBase: round2(taxableBase),
    taxWithheld: round2(taxWithheld),
    net: round2(net)
  };
}

export function grossFromTargetNet(source, settingsInput = {}) {
  const target = Math.max(0, Number(source.amount) || 0);
  let low = target;
  let high = Math.max(target * 3, target + 1_000_000);
  const candidate = { ...source, inputMode: 'GROSS' };

  while (monthlySalaryFromGross({ ...candidate, amount: high }, settingsInput).net < target) high *= 1.5;
  for (let i = 0; i < 70; i += 1) {
    const mid = (low + high) / 2;
    if (monthlySalaryFromGross({ ...candidate, amount: mid }, settingsInput).net < target) low = mid;
    else high = mid;
  }
  return round2(high);
}

export function normalizeSalary(source, settings) {
  const gross = source.inputMode === 'NET' ? grossFromTargetNet(source, settings) : Number(source.amount) || 0;
  return { ...source, amount: gross, enteredAmount: Number(source.amount) || 0 };
}

export function annualAmount(source) {
  const amount = Math.max(0, Number(source.amount) || 0);
  if (source.frequency === 'ANNUAL' || source.frequency === 'ONE_TIME') return amount;
  return amount * clamp(Number(source.months) || 12, 1, 12);
}
