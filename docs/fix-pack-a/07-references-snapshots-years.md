# 07 — References, Snapshots and Years

## Objetivo

Migrar tres responsabilidades de soporte que todavía vivían como llamadas
directas en `server/index.mjs`: referencias oficiales, años disponibles y
snapshots.

## Implementación realizada

- Contratos propios en `packages/contracts/src/support-catalogs.mjs`.
- Adaptadores diferidos en `packages/sqlite-adapter/src/support-repositories.mjs`.
- Casos de uso en `packages/application/src/support-use-cases.mjs`.
- Router HTTP en `server/routes/support-catalogs.mjs`.
- Composition root en `apps/local/src/support-catalog-composition.mjs`.
- `/api/years` y `POST /api/snapshots` ya pasan por `apps/local`.

## Transición explícita

`GET /api/bootstrap` todavía usa `listReferences()` directamente porque
bootstrap se mantiene como una operación de composición de datos de varias
fuentes. La extracción completa de bootstrap queda para el paso 08, cuando
se modularice la infraestructura HTTP común y se defina un `BootstrapService`
que coordine settings, ingresos y referencias sin hacer que el router
dependa de persistencia concreta.

## Verificación

- `npm test` pasa.
- `npm run architecture:check` pasa.
- `npm run build` y `vite build` pasan.
- `npm run pack:smoke` y `npm run smoke:local` pasan.
- La base temporal se limpia después de las pruebas.

## Commit

`6466377 refactor: complete references/years/snapshots (step 07)`
