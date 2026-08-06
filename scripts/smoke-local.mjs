import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const port = 3500 + Math.floor(Math.random() * 300);
const baseUrl = `http://127.0.0.1:${port}`;
const tempDir = await mkdtemp(join(tmpdir(), 'personal-tax-ledger-smoke-local-'));
const dbPath = join(tempDir, 'smoke.sqlite');

const child = spawn(process.execPath, ['server/index.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port), DB_PATH: dbPath },
  stdio: ['ignore', 'pipe', 'pipe']
});

let exitCode = 0;
try {
  const started = Date.now();
  let healthy = false;
  while (Date.now() - started < 10_000) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) { healthy = true; break; }
    } catch {
      // el servidor todavía no acepta conexiones
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  if (!healthy) throw new Error('El servidor no respondió /api/health dentro del tiempo esperado');

  const health = await (await fetch(`${baseUrl}/api/health`)).json();
  if (health.status !== 'ok') throw new Error(`Healthcheck inesperado: ${JSON.stringify(health)}`);

  const created = await (await fetch(`${baseUrl}/api/incomes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Smoke local', kind: 'SALARY', amount: 500_000, inputMode: 'GROSS', frequency: 'MONTHLY', months: 12, taxYear: 2026 })
  })).json();
  if (!created.id) throw new Error(`No se pudo crear un ingreso de prueba: ${JSON.stringify(created)}`);

  const listed = await (await fetch(`${baseUrl}/api/incomes?taxYear=2026`)).json();
  if (!Array.isArray(listed) || !listed.some(item => item.id === created.id)) {
    throw new Error(`El ingreso creado no aparece en el listado: ${JSON.stringify(listed)}`);
  }

  const simulation = await (await fetch(`${baseUrl}/api/simulate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sources: [], settings: { year: 2026 } })
  })).json();
  if (typeof simulation?.annualResult?.estimatedAnnualTax !== 'number') {
    throw new Error(`Respuesta de simulación inesperada: ${JSON.stringify(simulation)}`);
  }

  console.log('smoke:local ok: /api/health, /api/incomes y /api/simulate respondieron correctamente sobre un servidor real');
} catch (error) {
  console.error(error instanceof Error ? error.stack || error.message : error);
  exitCode = 1;
} finally {
  child.kill('SIGTERM');
  await new Promise(resolve => child.once('exit', resolve));
  await rm(tempDir, { recursive: true, force: true });
}

process.exit(exitCode);
