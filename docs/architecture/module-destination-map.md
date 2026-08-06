# Mapa de destinos tentativos

| Módulo actual | Destino tentativo | Motivo | Momento |
|---|---|---|---|
| `server/lib/calculator.mjs` | `packages/core` | Orquesta cálculos sin I/O. | A03, por porciones. |
| `server/lib/fee-calculator.mjs` | `packages/core` | Funciones puras de honorarios. | A03. |
| `server/lib/mortgage-calculator.mjs` | `packages/core` | Funciones puras del art. 55 bis. | A03. |
| `server/lib/calculation-explanation.mjs` | `packages/core` | Construye trazabilidad de resultados. | A03. |
| `server/lib/util.mjs` | `packages/core` parcial | Matemática y validaciones sin I/O. | A03; revisar exports. |
| `server/lib/defaults.mjs` | `packages/core` parcial | Defaults de cálculo; separar seeds de aplicación. | A03. |
| `server/lib/tax-parameters.mjs` | `packages/core` + adapter | Claves/reglas en core; lectura SQLite fuera. | A03/A06. |
| `server/lib/database.mjs` | `packages/sqlite-adapter` | SQLite, esquema, seeds y repositorios. | A06. |
| `server/lib/fee-receipts.mjs` | `packages/sqlite-adapter` | Persistencia de boletas. | A06, agregado elegido. |
| `server/lib/mortgages.mjs` | `packages/sqlite-adapter` | Persistencia hipotecaria. | Posterior a primer agregado. |
| `server/index.mjs` | `apps/local` + routers | Composition root y HTTP. | A07-A11. |
| `web/src/types.ts` | `packages/api-contracts` parcial | DTOs serializables; separar tipos de dominio. | A04. |
| `web/src/api.ts` | `apps/local` o cliente compartido | Transporte tipado consumido por UI. | A04/A09. |
| `web/src/calculation-explanation-panel.tsx` | `packages/shared-ui` | Componente independiente de infraestructura. | A10. |
| `web/src/App.tsx` | `apps/local` + páginas compartidas | Composition root React actual. | A09-A11. |
| `server/test/*` | Tests por paquete y aplicación | Mantener cobertura de regresión. | Todas. |
