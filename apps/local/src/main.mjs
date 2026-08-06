import { startServer, stopServer } from '../../../server/index.mjs';

let stopping = false;

export async function main(options) {
  await startServer(options);
  const shutdown = async signal => {
    if (stopping) return;
    stopping = true;
    try {
      await stopServer();
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

const isMain = process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url;
if (isMain) await main();
