import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const port = 3400 + Math.floor(Math.random() * 300);
const baseUrl = `http://127.0.0.1:${port}`;
let child;
let tempDir;

before(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'personal-tax-ledger-a01-'));
  child = spawn(process.execPath, ['apps/local/src/main.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port), DB_PATH: join(tempDir, 'test.sqlite') },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const started = Date.now();
  while (Date.now() - started < 10_000) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('El servidor HTTP no inició dentro del tiempo esperado');
});

after(async () => {
  child?.kill('SIGTERM');
  await new Promise(resolve => child?.once('exit', resolve));
  await rm(tempDir, { recursive: true, force: true });
});

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...options
  });
  const body = await response.json();
  return { response, body };
}

test('contrato HTTP de salud, simulación y errores', async () => {
  const health = await request('/api/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.body.status, 'ok');
  assert.equal(typeof health.body.year, 'number');

  const simulation = await request('/api/simulate', {
    method: 'POST',
    body: JSON.stringify({ sources: [], settings: { year: 2026 } })
  });
  assert.equal(simulation.response.status, 200);
  assert.equal(typeof simulation.body.annualResult.estimatedAnnualTax, 'number');
  assert.ok(Array.isArray(simulation.body.explanations));
  assert.equal(simulation.body.explanations.find(item => item.key === 'tax.annual').result.value, simulation.body.totals.annualTax);

  const invalid = await request('/api/incomes', {
    method: 'POST',
    body: JSON.stringify({ kind: 'SALARY', amount: 100 })
  });
  assert.equal(invalid.response.status, 400);
  assert.equal(invalid.body.code, 'invalid_name');
});

test('contrato HTTP de ingresos persistidos y cálculos especializados', async () => {
  const created = await request('/api/incomes', {
    method: 'POST',
    body: JSON.stringify({ name: 'Trabajo fixture', kind: 'SALARY', amount: 2_000_000, inputMode: 'GROSS', frequency: 'MONTHLY', months: 12, taxYear: 2026 })
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.body.name, 'Trabajo fixture');

  const listed = await request('/api/incomes?taxYear=2026');
  assert.equal(listed.response.status, 200);
  assert.ok(listed.body.some(item => item.id === created.body.id));

  const fee = await request('/api/fee-receipt-calc', {
    method: 'POST',
    body: JSON.stringify({ receipt: { amountInputType: 'GROSS', grossAmount: 1_000_000, withholdingMode: 'WITHHELD_BY_RECIPIENT', withholdingRate: 0.1525 } })
  });
  assert.equal(fee.response.status, 200);
  assert.equal(fee.body.withheldAmount, 152_500);
  assert.equal(fee.body.netAmount, 847_500);

  const mortgage = await request('/api/article-55-bis', {
    method: 'POST',
    body: JSON.stringify({ mortgages: [{ id: 'fixture-loan', propertyAlias: 'Casa fixture', eligibleForArticle55Bis: true, annualInterestPaid: 4_000_000 }], annualRecords: [], incomeEstimate: 30_000_000 })
  });
  assert.equal(mortgage.response.status, 200);
  assert.equal(mortgage.body.eligibleInterest, 4_000_000);
  assert.equal(mortgage.body.deduction, 4_000_000);

  const scenarios = await request('/api/scenarios', {
    method: 'POST',
    body: JSON.stringify({ sources: [], settings: { year: 2026 } })
  });
  assert.equal(scenarios.response.status, 200);
  assert.ok(scenarios.body.length >= 9);
});
