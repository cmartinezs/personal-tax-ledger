# 06 — Catálogos: Tax Parameters + Tax Rule Sources

## Objetivo

Octavo y noveno agregado. Catálogos tributarios globales, **sin
WorkspaceContext** (no tienen propietario). Contratos asíncronos con
`Promise<...>`, pero sin validar `assertWorkspaceContext` en los
métodos — se documenta explícitamente que son globales.

## Alcance

- `packages/contracts/src/tax-parameter.mjs`:
  `TAX_PARAMETER_REPOSITORY_METHODS = ['list','get','upsert']`
- `packages/contracts/src/tax-rule-source.mjs`:
  `TAX_RULE_SOURCE_REPOSITORY_METHODS = ['list','upsert','remove']`
- `packages/sqlite-adapter/src/tax-parameter-repository.mjs` +
  `tax-rule-source-repository.mjs` (envuelven `server/lib/database.mjs`
  vía `resolveDatabaseModule`).
- `packages/application/src/tax-parameter-use-cases.mjs` +
  `tax-rule-source-use-cases.mjs` (no llaman `assertWorkspaceContext`).
- `server/routes/tax-parameters.mjs` + `tax-rule-sources.mjs`.
- `apps/local/src/tax-parameter-composition.mjs` +
  `tax-rule-source-composition.mjs`.
- `server/index.mjs`: usa los routers nuevos.

## Criterios de aceptación

- `npm test`, `architecture:check` y `curl` contra
  `GET/PUT /api/tax-parameters` y `GET/POST/DELETE /api/tax-rule-sources`
  funcionan igual que antes.

## Commit

`refactor: complete tax parameters and tax rule sources via repository/use-case/router pattern`