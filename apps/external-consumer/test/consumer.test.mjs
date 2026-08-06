import test from 'node:test';
import { runConsumerSmoke } from './consumer.mjs';

test('external consumer importa y ejecuta los exports públicos', () => {
  runConsumerSmoke();
});
