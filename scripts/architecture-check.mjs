import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const forbidden = /(?:node:sqlite|node:http|react|react-dom|supabase|firebase)/i;
const importPattern = /(?:import\s+(?:[^'";]+\s+from\s+)?|export\s+[^'";]+\s+from\s+|require\s*\()(['"])([^'"]+)\1/g;

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(path));
    else if (/\.(?:mjs|js|ts|tsx)$/.test(entry.name)) result.push(path);
  }
  return result;
}

for (const directory of ['packages/core', 'packages/contracts']) {
  for (const file of await files(resolve(directory))) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(importPattern)) {
      if (forbidden.test(match[2])) throw new Error(`Dependencia prohibida en ${file}: ${match[2]}`);
    }
  }
}
console.log('Límites arquitectónicos verificados');
