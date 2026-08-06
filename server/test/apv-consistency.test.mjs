import test from 'node:test';
import assert from 'node:assert/strict';
import { simulatePortfolio, buildScenarios } from '../lib/calculator.mjs';
import { defaultSettings } from '../lib/defaults.mjs';

const settings = { ...defaultSettings, ufValue: 40844.79, utmValue: 71649 };
const utaValue = settings.utmValue * 12;

function salary(overrides = {}) {
  return {
    active: true,
    name: 'Trabajo',
    kind: 'SALARY',
    amount: 1_500_000,
    inputMode: 'GROSS',
    frequency: 'MONTHLY',
    months: 12,
    taxable: true,
    withholdingRate: 0,
    afpName: 'UNO',
    afpCommissionRate: null,
    healthSystem: 'FONASA',
    healthPlanAmount: 0,
    contractType: 'INDEFINITE',
    apvRegime: 'NONE',
    apvPaymentMethod: 'PAYROLL',
    apvMonthly: 0,
    notes: '',
    ...overrides
  };
}

function closeTo(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(Number(actual) - Number(expected)) <= tolerance, `esperado ${expected}, obtenido ${actual}`);
}

// Invariante global: el resumen (annualResult) y la simulación (totals) deben
// consumir el mismo resultado consolidado del motor.
function assertSummaryMatchesSimulation(result) {
  const a = result.annualResult;
  const t = result.totals;
  closeTo(a.estimatedBalance, t.estimatedBalance);
  closeTo(a.finalTaxableBase, t.taxableIncome);
  closeTo(a.estimatedAnnualTax, t.annualTax);
  closeTo(a.totalWithholdings, t.totalWithheld);
  closeTo(a.totalTaxableIncome, t.grossTaxableIncome);
  closeTo(a.totalApvRegimeBContribution, a.payrollApvContribution + a.directApvContribution);
  closeTo(a.totalApvRegimeBContribution, t.apvBAccepted);
}

test('Caso 1: dos sueldos sin APV — saldo anual consolidado esperado', () => {
  const sources = [
    salary({ name: 'Trabajo A', amount: 1_500_000 }),
    salary({ name: 'Trabajo B', amount: 1_800_000 })
  ];
  const result = simulatePortfolio(sources, settings);
  assertSummaryMatchesSimulation(result);
  // Valores verificados a mano: base 32.448.240, impuesto 1.099.828,08,
  // retenciones 369.358,56 y saldo por pagar 730.469,52.
  closeTo(result.annualResult.finalTaxableBase, 32_448_240);
  closeTo(result.annualResult.estimatedAnnualTax, 1_099_828.08);
  closeTo(result.annualResult.totalWithholdings, 369_358.56);
  closeTo(result.annualResult.estimatedBalance, 730_469.52);
  closeTo(result.annualResult.payrollApvContribution, 0);
  closeTo(result.annualResult.totalApvRegimeBContribution, 0);
});

test('Caso 2: APV por planilla en un sueldo — resumen y simulación muestran el mismo saldo', () => {
  const sources = [
    salary({ name: 'Trabajo A', amount: 1_500_000, apvRegime: 'NONE', apvMonthly: 0 }),
    salary({ name: 'Trabajo B', amount: 1_800_000, apvRegime: 'B', apvPaymentMethod: 'PAYROLL', apvMonthly: 200_000 })
  ];
  const result = simulatePortfolio(sources, settings);
  assertSummaryMatchesSimulation(result);
  closeTo(result.annualResult.payrollApvContribution, 2_400_000);
  closeTo(result.annualResult.finalTaxableBase, 30_048_240);
  closeTo(result.annualResult.estimatedBalance, 634_469.52);
});

test('Caso 3: APV por planilla en ambos sueldos — los aportes se suman y se aplican una sola vez', () => {
  const sources = [
    salary({ name: 'Trabajo A', amount: 1_500_000, apvRegime: 'B', apvPaymentMethod: 'PAYROLL', apvMonthly: 100_000 }),
    salary({ name: 'Trabajo B', amount: 1_800_000, apvRegime: 'B', apvPaymentMethod: 'PAYROLL', apvMonthly: 200_000 })
  ];
  const result = simulatePortfolio(sources, settings);
  assertSummaryMatchesSimulation(result);
  const payrollA = 100_000 * 12;
  const payrollB = 200_000 * 12;
  closeTo(result.annualResult.payrollApvContribution, payrollA + payrollB);
  closeTo(result.annualResult.totalApvRegimeBContribution, payrollA + payrollB);
  closeTo(result.annualResult.finalTaxableBase, 28_848_240);
});

test('Caso 4: APV por planilla más APV directo — total Régimen B consolida ambos', () => {
  const sources = [
    salary({ name: 'Trabajo B', amount: 1_800_000, apvRegime: 'B', apvPaymentMethod: 'PAYROLL', apvMonthly: 200_000 })
  ];
  const result = simulatePortfolio(sources, settings, { annualAmount: 1_200_000, regime: 'B' });
  assertSummaryMatchesSimulation(result);
  closeTo(result.annualResult.payrollApvContribution, 2_400_000);
  closeTo(result.annualResult.directApvContribution, 1_200_000);
  closeTo(result.annualResult.totalApvRegimeBContribution, 3_600_000);
  closeTo(result.annualResult.finalTaxableBase, 14_099_040);
});

test('Caso 5: APV Régimen A no rebaja la base imponible como si fuera Régimen B', () => {
  const sources = [
    salary({ name: 'Trabajo', amount: 1_500_000, apvRegime: 'A', apvPaymentMethod: 'PAYROLL', apvMonthly: 200_000 })
  ];
  const resultA = simulatePortfolio(sources, settings);
  const resultNone = simulatePortfolio([salary({ name: 'Trabajo', amount: 1_500_000 })], settings);
  // Régimen A genera bono, pero no reduce la base imponible.
  assert.ok(resultA.totals.apvAContributions > 0);
  assert.ok(resultA.totals.apvABonus > 0);
  closeTo(resultA.annualResult.finalTaxableBase, resultNone.annualResult.finalTaxableBase);
  closeTo(resultA.annualResult.payrollApvContribution, 0);
  closeTo(resultA.annualResult.directApvContribution, 0);
  closeTo(resultA.annualResult.totalApvRegimeBContribution, 0);
});

test('Caso 6: edición reactiva — cambiar el monto de APV actualiza el resultado', () => {
  const build = monthly => simulatePortfolio(
    [salary({ name: 'Trabajo', amount: 1_800_000, apvRegime: 'B', apvPaymentMethod: 'PAYROLL', apvMonthly: monthly })],
    settings
  );
  const low = build(100_000);
  const high = build(300_000);
  // El resumen consume el resultado fresco; un cambio de aporte debe reflejarse
  // en la base imponible y en el saldo (incremento de 200.000 x 12).
  closeTo(high.annualResult.finalTaxableBase, low.annualResult.finalTaxableBase - 2_400_000);
  assert.notEqual(Number(low.annualResult.estimatedBalance), Number(high.annualResult.estimatedBalance));
});

test('Caso 7: persistencia — guardar y recargar conserva el mismo resultado', () => {
  const sources = [
    salary({ name: 'Trabajo A', amount: 1_500_000 }),
    salary({ name: 'Trabajo B', amount: 1_800_000, apvRegime: 'B', apvPaymentMethod: 'PAYROLL', apvMonthly: 200_000 })
  ];
  const original = simulatePortfolio(sources, settings);
  // Simula el guardado/lectura en SQLite: las fuentes y el resultado se serializan
  // como JSON TEXT y se vuelven a cargar tal cual.
  const payload = JSON.parse(JSON.stringify(sources));
  const stored = JSON.parse(JSON.stringify(original.annualResult));
  const reloaded = simulatePortfolio(payload, settings);
  closeTo(reloaded.annualResult.estimatedBalance, stored.estimatedBalance);
  closeTo(reloaded.annualResult.finalTaxableBase, stored.finalTaxableBase);
  closeTo(reloaded.annualResult.estimatedAnnualTax, stored.estimatedAnnualTax);
  closeTo(reloaded.annualResult.totalWithholdings, stored.totalWithholdings);
  closeTo(reloaded.annualResult.totalApvRegimeBContribution, stored.totalApvRegimeBContribution);
  // La relación total = planilla + directo se conserva tras la recarga.
  assertSummaryMatchesSimulation(reloaded);
});

test('Caso 8: no doble aplicación — el aporte por planilla reduce la base exactamente una vez', () => {
  const withoutApv = simulatePortfolio([salary({ name: 'Trabajo', amount: 1_800_000 })], settings);
  const withPayrollApv = simulatePortfolio(
    [salary({ name: 'Trabajo', amount: 1_800_000, apvRegime: 'B', apvPaymentMethod: 'PAYROLL', apvMonthly: 200_000 })],
    settings
  );
  const annualPayrollApv = 200_000 * 12;
  // La base imponible final cae exactamente el aporte anual: ni más (doble rebaja)
  // ni menos (APV ignorado).
  closeTo(withoutApv.annualResult.finalTaxableBase - withPayrollApv.annualResult.finalTaxableBase, annualPayrollApv);
  // La renta consolidada (totalTaxableIncome) también refleja una sola rebaja.
  closeTo(withoutApv.annualResult.totalTaxableIncome - withPayrollApv.annualResult.totalTaxableIncome, annualPayrollApv);
  closeTo(withPayrollApv.annualResult.payrollApvContribution, annualPayrollApv);
});

test('Los escenarios de la simulación anual usan el mismo motor consolidado', () => {
  const sources = [
    salary({ name: 'Trabajo A', amount: 1_500_000 }),
    salary({ name: 'Trabajo B', amount: 1_800_000 })
  ];
  const scenarios = buildScenarios(sources, settings);
  const base = scenarios.find(s => s.key === 'base');
  assert.ok(base);
  assertSummaryMatchesSimulation(base.result);
  // La fuente de verdad es la misma: el motor expone annualResult en cada escenario.
  for (const s of scenarios) {
    assert.ok(s.result.annualResult, 'cada escenario debe exponer el resultado consolidado');
    closeTo(s.result.annualResult.estimatedBalance, s.result.totals.estimatedBalance);
    assert.ok(Number.isFinite(s.result.annualResult.finalTaxableBase));
  }
});

test('UTA usada en el test es consistente con los topes anuales', () => {
  assert.equal(utaValue, settings.utmValue * 12);
  assert.ok(utaValue > 0);
});
