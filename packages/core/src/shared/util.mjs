// Shared helpers for repositories and calculators.
// Monetary arithmetic is performed in integer CLP. We round with Math.round(value*100)/100
// to avoid naive floating-point artifacts; the calculator layer is responsible for never
// accumulating raw floats across operations.

export const round2 = value => Math.round((Number(value) || 0) * 100) / 100;
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

let counter = 0;
// Generates a sortable unique id using time + random + counter. UUIDs v4 require more
// than we need and add lexical difficulty when querying exported data.
export function generateId(prefix = '') {
  counter = (counter + 1) % 1000;
  return `${prefix}${Date.now().toString(36)}${counter.toString(36).padStart(3, '0')}${Math.random().toString(36).slice(2, 8)}`;
}

export function toBool(value) {
  if (typeof value === 'boolean') return value;
  if (value == null) return false;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
  return Boolean(value);
}

export function fromBool(value) {
  return value ? 1 : 0;
}

// Coerce to finite number with default fallback. Treats '' and null as 0.
export function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : Number(fallback) || 0;
}

const dateIso = /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/;
export function isValidDate(value) {
  return typeof value === 'string' && dateIso.test(value);
}

// Structured API error for validation failures. Repositories throw this so the
// HTTP layer can map it to a JSON ApiError response with fieldErrors.
export class ValidationError extends Error {
  constructor(code, message, fieldErrors = null) {
    super(message);
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.name = 'ValidationError';
  }
}
