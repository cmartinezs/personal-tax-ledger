import test from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import { packageName, ApiValidationError, apiError, handleRequestError, json, readJsonBody, queryInt, queryParam, queryYear } from '@personal-tax-ledger/http-api';

function createResponse() {
  let headers;
  let status;
  let body;
  return {
    _headers: () => headers,
    _status: () => status,
    _body: () => body,
    writeHead: (s, h) => { status = s; headers = h; },
    end: data => { body = data; }
  };
}

test('packageName del inbound adapter HTTP', () => {
  assert.equal(packageName, '@personal-tax-ledger/http-api');
});

test('json serializa respuestas con content-type JSON', () => {
  const res = createResponse();
  json(res, 201, { ok: true });
  assert.equal(res._status(), 201);
  assert.equal(res._headers()['content-type'], 'application/json; charset=utf-8');
  assert.deepEqual(JSON.parse(res._body()), { ok: true });
});

test('apiError incluye fieldErrors cuando existen', () => {
  const res = createResponse();
  apiError(res, 400, 'invalid_name', 'Nombre inválido', { name: 'obligatorio' });
  const parsed = JSON.parse(res._body());
  assert.equal(parsed.code, 'invalid_name');
  assert.deepEqual(parsed.fieldErrors, { name: 'obligatorio' });
});

test('handleRequestError mapea ApiValidationError a 400', () => {
  const res = createResponse();
  handleRequestError(res, new ApiValidationError('bad', 'mal', { field: 'x' }));
  assert.equal(res._status(), 400);
  assert.equal(JSON.parse(res._body()).code, 'bad');
});

test('handleRequestError mapea ValidationError por nombre a 400', () => {
  const res = createResponse();
  const error = new Error('dominio inválido');
  error.name = 'ValidationError';
  error.code = 'domain_invalid';
  error.fieldErrors = { amount: 'invalido' };
  handleRequestError(res, error);
  assert.equal(res._status(), 400);
  assert.deepEqual(JSON.parse(res._body()).fieldErrors, { amount: 'invalido' });
});

test('handleRequestError responde unexpected para errores desconocidos', () => {
  const res = createResponse();
  handleRequestError(res, new Error('boom'));
  assert.equal(res._status(), 400);
  assert.equal(JSON.parse(res._body()).code, 'unexpected');
});

test('readJsonBody parsea un cuerpo JSON válido', async () => {
  const req = new PassThrough();
  req.end('{"a":1}');
  assert.deepEqual(await readJsonBody(req), { a: 1 });
});

test('readJsonBody devuelve objeto vacío sin cuerpo', async () => {
  const req = new PassThrough();
  req.end();
  assert.deepEqual(await readJsonBody(req), {});
});

test('readJsonBody rechaza JSON inválido con ApiValidationError', async () => {
  const req = new PassThrough();
  req.end('{nope');
  await assert.rejects(() => readJsonBody(req), error => {
    assert.ok(error instanceof ApiValidationError);
    assert.equal(error.code, 'invalid_json');
    return true;
  });
});

test('queryYear usa el fallback cuando no hay taxYear', () => {
  const url = new URL('http://localhost/api/incomes');
  assert.equal(queryYear(url, 2026), 2026);
  assert.equal(queryYear(new URL('http://localhost/api/incomes?taxYear=2024'), 2026), 2024);
});

test('queryParam y queryInt leen parámetros opcionales', () => {
  const url = new URL('http://localhost/api/logs?page=3&kind=SYNC');
  assert.equal(queryParam(url, 'kind'), 'SYNC');
  assert.equal(queryParam(url, 'status'), undefined);
  assert.equal(queryInt(url, 'page'), 3);
  assert.equal(queryInt(url, 'pageSize'), undefined);
});
