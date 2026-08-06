import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export function currentFilePath(metaUrl) {
  return fileURLToPath(metaUrl);
}

export function isMainModule(metaUrl, argvPath = process.argv[1]) {
  return Boolean(argvPath && pathToFileURL(resolve(argvPath)).href === metaUrl);
}

export function resolveDataPath(pathValue = process.env.DB_PATH || 'server/data/apv-chile.sqlite', cwd = process.cwd()) {
  return resolve(cwd, pathValue);
}

export function directoryFor(pathValue) {
  return dirname(pathValue);
}
