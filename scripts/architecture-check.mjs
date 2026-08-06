import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scopePrefix = '@personal-tax-ledger/';
const packageRoots = ['packages', 'apps'];
const importPattern = /(?:import\s+(?:[^'";]+\s+from\s+)?|export\s+[^'";]+\s+from\s+|require\s*\()(['"])([^'"]+)\1/g;
const forbiddenRuntime = /^(?:node:sqlite|node:http|react|react-dom|supabase|firebase)(?:\/|$)/i;
const domainOnlyPackages = new Set(['core', 'contracts']);

async function listSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const result = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await listSourceFiles(path));
    else if (/\.(?:mjs|js|ts|tsx)$/.test(entry.name)) result.push(path);
  }
  return result;
}

async function discoverInternalPackages() {
  const packages = new Map();
  for (const root of packageRoots) {
    const entries = await readdir(resolve(root), { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const packageJsonPath = resolve(root, entry.name, 'package.json');
      let name;
      try {
        name = JSON.parse(await readFile(packageJsonPath, 'utf8')).name;
      } catch {
        continue;
      }
      if (!name) continue;
      packages.set(name, resolve(root, entry.name, 'src'));
    }
  }
  return packages;
}

function detectCycle(graph) {
  const visiting = new Set();
  const visited = new Set();

  function visit(node, path) {
    if (visited.has(node)) return;
    if (visiting.has(node)) return [...path, node];
    visiting.add(node);
    for (const dep of graph.get(node) || []) {
      const cycle = visit(dep, [...path, node]);
      if (cycle) return cycle;
    }
    visiting.delete(node);
    visited.add(node);
    return null;
  }

  for (const node of graph.keys()) {
    const cycle = visit(node, []);
    if (cycle) return cycle;
  }
  return null;
}

export async function runArchitectureCheck() {
  const packages = await discoverInternalPackages();
  const graph = new Map();

  for (const [name, srcDir] of packages) {
    const deps = new Set();
    for (const file of await listSourceFiles(srcDir)) {
      const source = await readFile(file, 'utf8');
      for (const match of source.matchAll(importPattern)) {
        const imported = match[2];
        const allowedInfrastructure = name === '@personal-tax-ledger/local-app' && imported === 'node:http'
          || name === '@personal-tax-ledger/sqlite-adapter' && imported === 'node:sqlite';
        if (forbiddenRuntime.test(imported) && !allowedInfrastructure) {
          throw new Error(`Dependencia prohibida en ${file}: ${imported}`);
        }
        if (imported.startsWith(scopePrefix)) {
          const depName = imported.split('/').slice(0, 2).join('/');
          if (depName !== name) deps.add(depName);
        }
      }
    }
    graph.set(name, deps);
  }

  for (const shortName of domainOnlyPackages) {
    const fullName = `${scopePrefix}${shortName}`;
    const deps = graph.get(fullName);
    if (deps && deps.size > 0) {
      throw new Error(`${fullName} no puede depender de otros paquetes internos (encontrado: ${[...deps].join(', ')})`);
    }
  }

  const cycle = detectCycle(graph);
  if (cycle) {
    throw new Error(`Ciclo de dependencias detectado entre paquetes internos: ${cycle.join(' -> ')}`);
  }

  return { packageCount: graph.size, graph };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMain) {
  const { packageCount } = await runArchitectureCheck();
  console.log(`Límites arquitectónicos verificados: ${packageCount} paquetes internos, sin ciclos, core/contracts sin dependencias internas.`);
}
