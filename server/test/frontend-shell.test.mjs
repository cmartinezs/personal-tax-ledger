import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('el shell frontend usa providers, navegación y servicios compartidos', async () => {
  const source = await readFile('web/src/main.tsx', 'utf8');
  const app = await readFile('web/src/app/App.tsx', 'utf8');
  const navigation = await readFile('web/src/app/navigation.ts', 'utf8');
  const providers = await readFile('web/src/app/AppProviders.tsx', 'utf8');
  const services = await readFile('web/src/app/create-services.ts', 'utf8');
  assert.match(source, /AppProviders/);
  assert.match(source, /\.\/app\/App/);
  assert.match(app, /\.\.\/App/);
  assert.match(navigation, /incomes/);
  assert.match(providers, /FeedbackProvider/);
  assert.match(services, /createIncomeService/);
});
