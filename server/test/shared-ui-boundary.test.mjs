import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('shared-ui no depende de infraestructura ni URLs de despliegue', async () => {
  const source = await readFile('packages/shared-ui/src/index.tsx', 'utf8');
  assert.doesNotMatch(source, /(?:firebase|supabase|node:sqlite|process\.env|https?:\/\/)/i);
  assert.match(source, /service/);
});
