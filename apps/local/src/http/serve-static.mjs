import { readFile, stat } from 'node:fs/promises';
import { extname, isAbsolute, join, relative, resolve } from 'node:path';
import { json } from '@personal-tax-ledger/http-api';

export async function serveStatic(req, res, webDist) {
  try {
    const root = resolve(webDist);
    const requestPath = new URL(req.url, 'http://localhost').pathname;
    const safePath = requestPath === '/' ? 'index.html' : decodeURIComponent(requestPath).replace(/^\/+/, '');
    let filePath = resolve(root, safePath);
    const relativePath = relative(root, filePath);
    if (relativePath.startsWith('..') || isAbsolute(relativePath)) throw new Error('Ruta estática inválida');
    try {
      const info = await stat(filePath);
      if (info.isDirectory()) filePath = join(filePath, 'index.html');
    } catch {
      filePath = join(root, 'index.html');
    }
    const data = await readFile(filePath);
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
    res.writeHead(200, { 'content-type': `${types[extname(filePath)] || 'application/octet-stream'}; charset=utf-8` });
    res.end(data);
  } catch {
    json(res, 404, { error: 'Frontend no compilado. Ejecute npm install y npm run build.' });
  }
}
