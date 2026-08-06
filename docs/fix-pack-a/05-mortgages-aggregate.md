# 05 — Mortgages + Mortgage Annual Records

## Objetivo

Sexto y séptimo agregado: `MortgageRepository` (préstamos) y
`MortgageAnnualRecordRepository` (registros anuales), con la relación
padre-hijo y la sincronización existente
(`syncLoanAnnualSnapshot`) preservada tal cual.

## Alcance

- `packages/contracts/src/mortgage.mjs`:
  `MORTGAGE_REPOSITORY_METHODS = ['list','get','create','update','remove']`.
- `packages/contracts/src/mortgage-annual-record.mjs`:
  `MORTGAGE_ANNUAL_RECORD_REPOSITORY_METHODS = ['listByLoan','listByYear','get','create','update','remove']`
  (se agrega `listByYear` porque `server/lib/mortgages.mjs` ya expone
  `listAnnualRecordsByYear`, usado en otras partes — se incluye en el
  contrato para no perder esa capacidad).
- `packages/sqlite-adapter/src/mortgage-repository.mjs` +
  `mortgage-annual-record-repository.mjs`: envuelven
  `server/lib/mortgages.mjs` con el mismo patrón de `import()` diferido
  compartido (`mortgages-module.mjs`, análogo a
  `fee-receipts-module.mjs`).
- `packages/application/src/mortgage-use-cases.mjs` +
  `mortgage-annual-record-use-cases.mjs`.
- `server/routes/mortgages.mjs`: rutas
  `GET/POST /api/mortgages`, `GET/PUT/DELETE /api/mortgages/:id`,
  `GET/POST /api/mortgages/:id/annual-records`,
  `PUT/DELETE /api/mortgage-annual-records/:id`.
- `apps/local/src/mortgage-composition.mjs`.
- `server/index.mjs`: usa los routers nuevos; se elimina el objeto
  `repo` intermedio (ya solo tenía funciones de hipotecario tras el
  paso 04).

## Restricciones

- Mismos endpoints/payloads/filtros.
- `createAnnualRecord` sigue lanzando `ValidationError` si el préstamo
  no existe (`mortgage_not_found`) — se preserva ese comportamiento.
- La sincronización `syncLoanAnnualSnapshot` se queda dentro de
  `server/lib/mortgages.mjs` (mismo argumento que en boletas: es
  coordinación entre dos tablas ya resuelta a nivel de persistencia; no
  se reescribe en esta iteración).

## Criterios de aceptación

- Contratos propios, sin reutilizar métodos de otros agregados.
- `npm test`, `architecture:check` y `curl` contra
  `/api/mortgages` y `/api/mortgages/:id/annual-records` (crear
  préstamo, agregar registro anual, confirmar que el préstamo refleja
  el snapshot, error 404/`mortgage_not_found`) siguen funcionando.

## Commit

`refactor: complete mortgages and mortgage annual records via repository/use-case/router pattern`
