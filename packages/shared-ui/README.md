# `@personal-tax-ledger/shared-ui`

Biblioteca React de componentes presentacionales reutilizables entre la aplicación local y consumidores externos. No contiene transporte, persistencia ni reglas tributarias.

## Contrato de un componente

Un componente de `shared-ui`:

- recibe datos, formatos y callbacks por props;
- no ejecuta `fetch`, accede a SQLite o lee `process.env`;
- no importa archivos de `web/src` ni módulos de `server`;
- puede ser renderizado por una aplicación que no conoce este repositorio;
- mantiene tipos públicos explícitos y evita `any` salvo una razón documentada.

## Componentes actuales

- `IncomesSection`: lista de ingresos, métricas y acciones abstractas.
- `SummaryMetrics`: métricas con hints y acción de explicación.
- `Panel`, `EmptyState`, `StatusBadge`: primitives de layout/estado.
- `FeeReceiptsTable`: tabla presentacional de boletas.
- `MortgageSummary`: resumen de créditos e intereses.
- `ScenarioTable`: resultados comparables de escenarios.
- `SettingsForm`: formulario genérico de campos y callback de guardado.

## Source y artefacto

- [`src/README.md`](src/README.md): fuente TypeScript/TSX.
- `dist/index.js` y `dist/index.d.ts`: export público versionado.
- [`test/README.md`](test/README.md): tests del workspace.
- [`dist/README.md`](dist/README.md): cómo regenerar el artefacto.

## Desarrollo

```bash
npm run build --workspace @personal-tax-ledger/shared-ui
npm test --workspace @personal-tax-ledger/shared-ui
node scripts/shared-ui-consumer-smoke.mjs
```

Después de modificar `src`, recompila y revisa que `dist/` esté actualizado. La política de export está detallada en [`docs/architecture/package-policy.md`](../../docs/architecture/package-policy.md).
