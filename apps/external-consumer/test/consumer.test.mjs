import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runConsumerSmoke } from './consumer.mjs';

test('external consumer importa y ejecuta los exports públicos', async () => {
  await runConsumerSmoke();
});

test('external consumer no depende de roots locales ni persistencia concreta', async () => {
  const source = await readFile(new URL('./consumer.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /@personal-tax-ledger\/(?:sqlite-adapter|local-app)/);
  assert.doesNotMatch(source, /from\s+['"](?:server|web|apps\/local)(?:\/|['"])/);
});
