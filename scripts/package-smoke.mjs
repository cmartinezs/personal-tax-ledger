import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const root = process.cwd();
const temp = mkdtempSync(join(tmpdir(), 'personal-tax-ledger-pack-'));
try {
  for (const packagePath of ['packages/core', 'packages/contracts', 'packages/api-contracts', 'packages/shared-ui']) {
    execFileSync('npm', ['pack', '--pack-destination', temp], { cwd: join(root, packagePath), stdio: 'pipe' });
  }
  const tarballs = ['personal-tax-ledger-core-0.1.0.tgz', 'personal-tax-ledger-contracts-0.1.0.tgz', 'personal-tax-ledger-api-contracts-0.1.0.tgz', 'personal-tax-ledger-shared-ui-0.1.0.tgz'];
  for (const tarball of tarballs) execFileSync('test', ['-f', join(temp, tarball)]);
  execFileSync('npm', ['init', '-y'], { cwd: temp, stdio: 'ignore' });
  execFileSync('npm', ['install', '--no-save', '--ignore-scripts', ...tarballs.map(tarball => join(temp, tarball))], { cwd: temp, stdio: 'pipe' });
  console.log(`Empaquetado e instalación local verificados: ${tarballs.length} tarballs`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
