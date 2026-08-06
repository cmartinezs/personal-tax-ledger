import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const root = process.cwd();
const temp = mkdtempSync(join(tmpdir(), 'personal-tax-ledger-pack-'));
try {
  const packagePaths = ['packages/core', 'packages/contracts', 'packages/application', 'packages/api-contracts', 'packages/shared-ui'];
  for (const packagePath of packagePaths) {
    execFileSync('npm', ['pack', '--pack-destination', temp], { cwd: join(root, packagePath), stdio: 'pipe' });
  }
  const tarballs = [
    'personal-tax-ledger-core-0.1.0.tgz',
    'personal-tax-ledger-contracts-0.1.0.tgz',
    'personal-tax-ledger-application-0.1.0.tgz',
    'personal-tax-ledger-api-contracts-0.1.0.tgz',
    'personal-tax-ledger-shared-ui-0.1.0.tgz'
  ];
  for (const tarball of tarballs) execFileSync('test', ['-f', join(temp, tarball)]);

  execFileSync('npm', ['init', '-y'], { cwd: temp, stdio: 'ignore' });
  execFileSync('npm', [
    'install', '--no-save', '--ignore-scripts',
    'react@19.2.7', 'react-dom@19.2.7',
    ...tarballs.map(tarball => join(temp, tarball))
  ], { cwd: temp, stdio: 'pipe' });

  // A pesar de que `npm install` de los tarballs termine sin errores, eso
  // solo demuestra que el paquete se puede instalar, no que sus exports
  // funcionen. Este script se ejecuta como consumidor real: importa cada
  // paquete empaquetado y ejercita al menos una función/comportamiento,
  // para detectar builds rotos o exports que apunten a un archivo
  // inexistente (ver docs/gaps/migration-fails.md, hallazgo 4).
  const smokeScript = `
    import assert from 'node:assert/strict';
    import { createElement } from 'react';
    import { renderToStaticMarkup } from 'react-dom/server';
    import { simulatePortfolio, defaultSettings, packageName as corePackageName } from '@personal-tax-ledger/core';
    import { LOCAL_WORKSPACE_CONTEXT, packageName as contractsPackageName } from '@personal-tax-ledger/contracts';
    import { incomeSourceRequest, packageName as apiContractsPackageName } from '@personal-tax-ledger/api-contracts';
    import { createIncomeUseCases } from '@personal-tax-ledger/application';
    import { IncomesSection } from '@personal-tax-ledger/shared-ui';

    assert.equal(corePackageName, '@personal-tax-ledger/core');
    const simulation = simulatePortfolio([], defaultSettings);
    assert.equal(typeof simulation.totals.annualTax, 'number');
    assert.equal(simulation.totals.annualTax, 0);

    assert.equal(contractsPackageName, '@personal-tax-ledger/contracts');
    assert.equal(LOCAL_WORKSPACE_CONTEXT.workspaceId, 'local-workspace');

    assert.equal(apiContractsPackageName, '@personal-tax-ledger/api-contracts');
    const dto = incomeSourceRequest({ name: ' Smoke ', kind: 'SALARY', amount: '1', taxYear: 2026 });
    assert.equal(dto.name, 'Smoke');

    const context = { workspaceId: 'smoke-workspace', actorId: 'smoke-user' };
    const calls = [];
    const useCases = createIncomeUseCases({ repository: {
      list: async (receivedContext, year) => { calls.push(['list', receivedContext, year]); return []; },
      get: async () => null,
      create: async (receivedContext, input) => { calls.push(['create', receivedContext, input]); return { ...input, id: 1 }; },
      update: async () => null,
      remove: async () => false,
      copy: async () => []
    }});
    const created = await useCases.createIncomeSource(context, dto);
    assert.equal(created.id, 1);
    assert.equal(calls[0][0], 'create');

    const html = renderToStaticMarkup(createElement(IncomesSection, {
      sources: [{ id: 1, kind: 'SALARY', name: 'Smoke fixture', amount: 1, frequency: 'MONTHLY', months: 12 }],
      taxYear: 2026,
      prevYears: [],
      busy: false,
      formatAmount: value => String(value),
      formatFrequencyLabel: frequency => frequency,
      sourceAnnual: source => source.amount * source.months,
      sourceHint: () => '',
      onEdit: () => {},
      onRemove: () => {},
      onCopyFromPrevious: () => {}
    }));
    assert.match(html, /Smoke fixture/);

    console.log('smoke ok: core, contracts, api-contracts y shared-ui se ejecutaron desde sus tarballs');
  `;
  const scriptPath = join(temp, 'smoke.mjs');
  writeFileSync(scriptPath, smokeScript);
  const result = spawnSync(process.execPath, [scriptPath], { cwd: temp, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`El smoke de paquetes falló:\n${result.stdout}\n${result.stderr}`);
  }
  console.log(result.stdout.trim());
  console.log(`Empaquetado, instalación y ejecución real verificados: ${tarballs.length} tarballs`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
