import { round2 } from './util.mjs';

export function formatCalculationValue(value, unit = 'CLP') {
  if (value == null) return 'No calculado';
  if (unit === 'PERCENT') return `${(Number(value) * 100).toFixed(2).replace('.', ',')}%`;
  if (unit === 'MONTHS') return `${Number(value)} meses`;
  if (unit === 'NONE') return String(value);
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(value) || 0);
}

export function calculationInput(key, label, value, origin, unit = 'CLP', description) {
  return { key, label, value, formattedValue: formatCalculationValue(value, unit), unit, origin, ...(description ? { description } : {}) };
}

export function calculationResult(label, value, unit = 'CLP', interpretation) {
  return { label, value, formattedValue: formatCalculationValue(value, unit), ...(interpretation ? { interpretation } : {}) };
}

export function calculationStep(order, label, expression, appliedExpression, result, unit = 'CLP', description) {
  return { order, label, ...(description ? { description } : {}), expression, appliedExpression, result, formattedResult: formatCalculationValue(result, unit) };
}

export function explained(key, title, shortDescription, details) {
  return {
    key,
    title,
    shortDescription,
    ...details,
    result: details.result,
    taxYear: details.taxYear,
    ruleVersion: details.ruleVersion,
    generatedAt: details.generatedAt
  };
}

export function numeric(value) {
  return round2(Number(value) || 0);
}
