import test from 'node:test';
import { runInnerHexagonSmoke } from './inner-hexagon.mjs';

test('inner hexagon (core + contracts + application) ejecuta casos de uso con fakes en memoria', async () => {
  await runInnerHexagonSmoke();
});
