import { round2 } from '../../shared/util.mjs';
import { simulatePortfolio } from '../portfolio/calculator.mjs';

export function compareApv(sources, settings, annualContribution, modules) {
  const contribution = Math.max(0, Number(annualContribution) || 0);
  const baseline = simulatePortfolio(sources, settings, { annualAmount: 0, regime: 'NONE' }, modules);
  const regimeA = simulatePortfolio(sources, settings, { annualAmount: contribution, regime: 'A' }, modules);
  const regimeB = simulatePortfolio(sources, settings, { annualAmount: contribution, regime: 'B' }, modules);
  const bTaxSaving = Math.max(0, baseline.totals.annualTax - regimeB.totals.annualTax);
  const aBonus = Math.max(0, regimeA.totals.apvABonus - baseline.totals.apvABonus);
  const recommendation = bTaxSaving > aBonus
    ? 'B ofrece el mayor beneficio tributario inmediato bajo los supuestos actuales. Recuerda que compromete liquidez para fines previsionales.'
    : aBonus > bTaxSaving
      ? 'A ofrece el mayor beneficio estatal inmediato bajo los supuestos actuales.'
      : 'A y B producen un beneficio inmediato similar; la decisión depende de liquidez, retiro futuro y tributación al pensionarse.';
  return {
    annualContribution: round2(contribution),
    baseline,
    regimeA: { ...regimeA, incrementalBenefit: round2(aBonus), effectiveCashCost: round2(contribution - aBonus) },
    regimeB: { ...regimeB, incrementalBenefit: round2(bTaxSaving), effectiveCashCost: round2(contribution - bTaxSaving) },
    recommendation
  };
}
