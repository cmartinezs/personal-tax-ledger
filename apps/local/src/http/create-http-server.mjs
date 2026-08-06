import { createServer } from 'node:http';

export function createHttpServer(requestHandler) {
  return createServer(requestHandler);
}
