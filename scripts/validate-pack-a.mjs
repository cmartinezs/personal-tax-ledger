import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function run(command, args) {
  console.log(`\n$ ${command} ${args.join(' ')}`);
  execFileSync(command, args, { stdio: 'inherit' });
}

const prohibited = [
  ['packages/application', /(?:from\s+['"](?:\.\.\/)+server\/lib\/database\.mjs|from\s+['"]@personal-tax-ledger\/sqlite-adapter['"]|from\s+['"]node:sqlite['"])/],
  ['packages/shared-ui', /(?:from\s+['"](?:\.\.\/)+web\/src|from\s+['"](?:\.\.\/)+server\/|fetch\s*\()/]
];

for (const [directory, pattern] of prohibited) {
  let files = '';
  try {
    files = execFileSync('rg', ['-l', '-g', '*.{mjs,js,ts,tsx}', pattern.source, directory], { encoding: 'utf8' }).trim();
  } catch (error) {
    if (error.status !== 1) throw error;
  }
  if (files) throw new Error(`Import/dependencia prohibida en ${directory}:\n${files}`);
}

const routeCatalog = readFileSync('docs/architecture/http-route-catalog.md', 'utf8');
for (const path of ['/api/health', '/api/bootstrap', '/api/incomes', '/api/fee-receipts', '/api/mortgages', '/api/simulate', '/api/snapshots']) {
  if (!routeCatalog.includes(path)) throw new Error(`Ruta ausente del catálogo: ${path}`);
}

const required = [
  ['npm', ['test']],
  ['npm', ['run', 'architecture:check']],
  ['npm', ['run', 'build']],
  ['npm', ['run', 'build:packages']],
  ['npm', ['run', 'test:workspaces']],
  ['npm', ['run', 'pack:dry-run']],
  ['npm', ['run', 'pack:smoke']],
  ['npm', ['run', 'smoke:local']]
];
for (const [command, args] of required) run(command, args);

console.log('\nvalidate:pack-a PASS');
