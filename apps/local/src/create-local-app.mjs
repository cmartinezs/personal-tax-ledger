import { resolve } from 'node:path';
import { createLocalComposition } from './composition/create-local-composition.mjs';
import { createHttpServer } from './http/create-http-server.mjs';
import { createHttpRouter } from './http/router.mjs';

const configuredPort = Number(process.env.PORT || 3001);

export function createLocalApp({ composition = createLocalComposition(), port = configuredPort, webDist = resolve('web/dist') } = {}) {
  const server = createHttpServer(createHttpRouter({ composition, webDist }));
  return {
    server,
    start() {
      return new Promise((resolveStart, reject) => {
        const onError = error => {
          server.off('listening', onListening);
          reject(error);
        };
        const onListening = () => {
          server.off('error', onError);
          console.log(`API disponible en http://localhost:${port}`);
          resolveStart(server);
        };
        server.once('error', onError);
        server.once('listening', onListening);
        server.listen(port);
      });
    },
    stop() {
      return new Promise((resolveStop, reject) => {
        if (!server.listening) {
          composition.close?.();
          resolveStop();
          return;
        }
        server.close(error => {
          if (error) {
            reject(error);
            return;
          }
          composition.close?.();
          resolveStop();
        });
      });
    }
  };
}

let runningApp;

export async function startServer(options) {
  runningApp ??= createLocalApp(options);
  return runningApp.start();
}

export async function stopServer() {
  if (!runningApp) return;
  await runningApp.stop();
  runningApp = undefined;
}
