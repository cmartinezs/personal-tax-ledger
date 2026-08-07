import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('incomes vive en features y está conectado a la aplicación real', async () => {
  const app = await readFile('apps/local/web/src/app/WorkspaceView.tsx', 'utf8');
  const feature = await readFile('apps/local/web/src/features/incomes/IncomesSection.tsx', 'utf8');
  const service = await readFile('apps/local/web/src/features/incomes/service.ts', 'utf8');
  assert.match(app, /features\/incomes\/IncomesSection/);
  assert.match(feature, /incomes-section/);
  assert.match(service, /income-service/);
});
