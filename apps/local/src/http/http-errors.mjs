export class ApiValidationError extends Error {
  constructor(code, message, fieldErrors = null) {
    super(message);
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

export function apiError(res, status, code, message, fieldErrors = null) {
  const body = { code, message };
  if (fieldErrors) body.fieldErrors = fieldErrors;
  return json(res, status, body);
}
