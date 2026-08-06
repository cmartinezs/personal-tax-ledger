import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('shared-ui no depende de infraestructura ni URLs de despliegue', async () => {
  const source = await readFile('packages/shared-ui/src/index.tsx', 'utf8');
  assert.doesNotMatch(source, /(?:firebase|supabase|node:sqlite|process\.env|https?:\/\/|fetch\()/i);
  assert.match(source, /export function IncomesSection/);
  assert.match(source, /export function SummaryMetrics/);
  assert.match(source, /onEdit/);
  assert.match(source, /onRemove/);
});

test('shared-ui exporta un build compilado en dist, no el .tsx fuente', async () => {
  const packageJson = JSON.parse(await readFile('packages/shared-ui/package.json', 'utf8'));
  assert.equal(packageJson.exports['.'].default, './dist/index.js');
  assert.equal(packageJson.exports['.'].types, './dist/index.d.ts');
  assert.equal(packageJson.scripts.build, 'tsc');
  await readFile('packages/shared-ui/dist/index.js', 'utf8');
  await readFile('packages/shared-ui/dist/index.d.ts', 'utf8');
});
