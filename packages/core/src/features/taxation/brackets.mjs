import { round2 } from '../../shared/util.mjs';

export const annualBrackets = [
  { max: 13.5, factor: 0, rebate: 0 },
  { max: 30, factor: 0.04, rebate: 0.54 },
  { max: 50, factor: 0.08, rebate: 1.74 },
  { max: 70, factor: 0.135, rebate: 4.49 },
  { max: 90, factor: 0.23, rebate: 11.14 },
  { max: 120, factor: 0.304, rebate: 17.80 },
  { max: 310, factor: 0.35, rebate: 23.32 },
  { max: Infinity, factor: 0.40, rebate: 38.82 }
];

export function taxFromTaxableIncome(taxableIncome, unitValue) {
  const income = Math.max(0, Number(taxableIncome) || 0);
  const unit = Math.max(1, Number(unitValue) || 1);
  const units = income / unit;
  const bracket = annualBrackets.find(item => units <= item.max) ?? annualBrackets.at(-1);
  return round2(Math.max(0, income * bracket.factor - unit * bracket.rebate));
}
