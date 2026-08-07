import { readFile, readdir } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scopePrefix = '@personal-tax-ledger/';
const packageRoots = ['packages', 'apps'];
const importPattern = /(?:import\s+(?:[^'";]+\s+from\s+)?|export\s+[^'";]+\s+from\s+|require\s*\()(['"])([^'"]+)\1/g;
const forbiddenRuntime = /^(?:node:sqlite|node:http|react|react-dom|supabase|firebase)(?:\/|$)/i;
const legacyRoots = ['server', 'web', 'apps/local'];
const hostPackages = new Set(['@personal-tax-ledger/local-app', '@personal-tax-ledger/external-consumer']);

const allowedInternalDeps = {
  '@personal-tax-ledger/core': [],
  '@personal-tax-ledger/contracts': [],
  '@personal-tax-ledger/api-contracts': [],
  '@personal-tax-ledger/application': ['@personal-tax-ledger/contracts', '@personal-tax-ledger/core'],
  '@personal-tax-ledger/sqlite-adapter': ['@personal-tax-ledger/contracts', '@personal-tax-ledger/core'],
  '@personal-tax-ledger/shared-ui': ['@personal-tax-ledger/api-contracts'],
  '@personal-tax-ledger/frontend-application': ['@personal-tax-ledger/api-contracts', '@personal-tax-ledger/application', '@personal-tax-ledger/contracts', '@personal-tax-ledger/core', '@personal-tax-ledger/shared-ui'],
  '@personal-tax-ledger/http-api': ['@personal-tax-ledger/application', '@personal-tax-ledger/contracts', '@personal-tax-ledger/api-contracts', '@personal-tax-ledger/core']
};

const transientLegacyImports = {
  '@personal-tax-ledger/local-app': [/^server\/routes\/.*\.mjs$/, /^server\/lib\/util\.mjs$/]
};

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
      packages.set(name, { root: resolve(root, entry.name), src: resolve(root, entry.name, 'src') });
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

function isLegacyRootImport(resolved) {
  for (const root of legacyRoots) {
    const prefix = `${root}${sep}`;
    if (resolved === root || resolved.startsWith(prefix)) return root;
  }
  return null;
}

export async function runArchitectureCheck() {
  const packages = await discoverInternalPackages();
  const graph = new Map();

  for (const [name, { root, src }] of packages) {
    const deps = new Set();
    const isHost = hostPackages.has(name);
    const allowed = allowedInternalDeps[name];

    for (const file of await listSourceFiles(src)) {
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
          if (depName !== name) {
            deps.add(depName);
            if (!isHost && allowed && !allowed.includes(depName)) {
              throw new Error(`${name} no puede depender de ${depName} (import en ${file})`);
            }
          }
          continue;
        }

        if (imported.startsWith('.')) {
          const resolved = relative(resolve(process.cwd()), resolve(file, '..', imported));
          const insideOwnRoot = relative(root, resolve(file, '..', imported));
          if (!insideOwnRoot.startsWith('..') && !insideOwnRoot.startsWith(sep) && insideOwnRoot !== '') continue;
          const legacyRoot = isLegacyRootImport(resolved);
          if (!legacyRoot) continue;
          const transient = transientLegacyImports[name]?.some(pattern => pattern.test(resolved));
          if (transient) continue;
          throw new Error(`${name} importa un root legacy (${legacyRoot}/) desde ${file}: ${imported}`);
        }
      }
    }

    if (name === '@personal-tax-ledger/application' && deps.has('@personal-tax-ledger/sqlite-adapter')) {
      throw new Error('application no puede depender de sqlite-adapter');
    }

    graph.set(name, deps);
  }

  for (const [shortName, fullName] of [['core', '@personal-tax-ledger/core'], ['contracts', '@personal-tax-ledger/contracts']]) {
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
  console.log(`Límites arquitectónicos verificados: ${packageCount} paquetes internos, sin ciclos, core/contracts sin dependencias internas, aplicación sin acceso a sqlite-adapter, packages sin imports a roots legacy.`);
}
