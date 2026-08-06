import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { json } from './http-errors.mjs';

export async function serveStatic(req, res, webDist) {
  try {
    const requestPath = new URL(req.url, 'http://localhost').pathname;
    const safePath = requestPath === '/' ? 'index.html' : decodeURIComponent(requestPath).replace(/^\/+/, '');
    let filePath = resolve(webDist, safePath);
    if (!filePath.startsWith(`${webDist}/`) && filePath !== webDist) throw new Error('Ruta estática inválida');
    try {
      const info = await stat(filePath);
      if (info.isDirectory()) filePath = join(filePath, 'index.html');
    } catch {
      filePath = join(webDist, 'index.html');
    }
    const data = await readFile(filePath);
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
    res.writeHead(200, { 'content-type': `${types[extname(filePath)] || 'application/octet-stream'}; charset=utf-8` });
    res.end(data);
  } catch {
    json(res, 404, { error: 'Frontend no compilado. Ejecute npm install y npm run build.' });
  }
}
