import { createLocalApp } from './create-local-app.mjs';
import { isMainModule } from './platform/paths.mjs';

let stopping = false;

export async function main(options) {
  const app = createLocalApp(options);
  await app.start();
  const shutdown = async signal => {
    if (stopping) return;
    stopping = true;
    try {
      await app.stop();
      if (signal) process.exitCode = 0;
    } catch (error) {
      console.error(`Error cerrando la aplicación local tras ${signal || 'shutdown'}:`, error);
      process.exitCode = 1;
    }
  };
  process.once('SIGINT', () => { void shutdown('SIGINT'); });
  process.once('SIGTERM', () => { void shutdown('SIGTERM'); });
  return { shutdown };
}

if (isMainModule(import.meta.url)) await main();
