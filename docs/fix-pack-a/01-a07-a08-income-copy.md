# 01 — A07/A08: copia de ingresos a través del caso de uso

## Objetivo

`copyIncomeSources` deja de ser una función concreta de
`server/lib/database.mjs` inyectada directamente al router de ingresos.
Pasa a ser un método del contrato `IncomeSourceRepository` y un caso de
uso propio en `packages/application`, coordinado por el router sin que
este conozca SQLite.

## Alcance

- `packages/contracts/src/index.d.ts` y `src/index.mjs`: agregar `copy`
  a `INCOME_REPOSITORY_METHODS` / `IncomeSourceRepository`.
- `packages/sqlite-adapter/src/index.mjs`: implementar `copy(context,
  fromTaxYear, toTaxYear)` reutilizando `copyIncomeSources` desde
  `server/lib/database.mjs` (vía el mismo `import()` diferido ya usado
  para el resto de los métodos).
- `packages/application/src/index.mjs`: agregar
  `copyIncomeSources(context, fromTaxYear, toTaxYear)` al caso de uso.
- `server/routes/incomes.mjs`: usar `useCases.copyIncomeSources` en vez
  de recibir `copyIncomeSources` como dependencia concreta.
- `server/index.mjs` / `apps/local`: dejar de pasar `copyIncomeSources`
  como dependencia del router.
- Tests: `server/test/repository-contracts.test.mjs`,
  `application-use-case.test.mjs`, `sqlite-adapter-contract.test.mjs`
  (la suite reutilizable de `packages/contracts/src/testing.mjs` gana
  un caso para `copy`), `http-contract.test.mjs` (ya cubre
  `/api/incomes/copy`, debe seguir pasando sin cambios de
  comportamiento).

## Restricciones

- Comportamiento observable idéntico: mismo endpoint
  `POST /api/incomes/copy`, mismo payload, mismo código 409 cuando el
  año destino ya tiene datos.
- `copy` retorna `Promise<IncomeSourceRecord[] | null>` (null cuando el
  año destino ya tiene datos), consistente con el resto del contrato
  asíncrono.
- No se toca `server/lib/database.mjs` internamente; solo se envuelve.

## Criterios de aceptación

- `assertRepositoryContract` exige `copy` además de los 5 métodos
  existentes.
- El caso de uso valida `WorkspaceContext` antes de delegar.
- El router ya no recibe `copyIncomeSources` en sus dependencias.
- `npm test`, `architecture:check` y un `curl` manual a
  `/api/incomes/copy` (caso éxito y caso 409) siguen funcionando.

## Commit

`refactor: complete income copy via use case (A07/A08)`
