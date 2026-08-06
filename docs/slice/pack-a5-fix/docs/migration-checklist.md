# Checklist de migración — pack-a5-fix

Marca cada casilla al fusionar el PR correspondiente. No avances al
siguiente prompt sin marcar el anterior.

## 01 — Contrato de repositorio asíncrono (A05)

- [ ] `IncomeSourceRepository` en `packages/contracts` tipado con
      `Promise<...>` en los cinco métodos.
- [ ] `packages/application` usa `async`/`await` en todos los casos de uso.
- [ ] `packages/sqlite-adapter` envuelve las llamadas síncronas de
      `node:sqlite` en funciones `async`.
- [ ] `server/routes/incomes.mjs` usa `await` en cada llamada a los casos
      de uso (ya es un handler `async`).
- [ ] Todos los tests que llaman al repositorio/casos de uso usan
      `await`.
- [ ] `npm test` y `npm run architecture:check` verdes.

## 02 — Suite de contract tests reutilizable (A06)

- [ ] Existe `incomeSourceRepositoryContract(createRepository, createContext)`
      exportado desde `packages/contracts`.
- [ ] `server/test/sqlite-adapter-contract.test.mjs` reemplaza el script
      ad hoc por la suite reutilizable.
- [ ] Existe al menos un segundo repositorio (fake en memoria) que pasa
      la misma suite, demostrando reutilización real.

## 03 — Cierre formal de la integración de ingresos (A09)

- [ ] Prueba unitaria real de `income-service.ts` (con un cliente falso),
      no solo verificación estática de texto.
- [ ] Confirmado que las 4 operaciones (list/create/update/remove) usan
      el servicio end-to-end (test o registro de ejecución).

## 04 — shared-ui con build propio (A10)

- [x] `IncomesSection` usa un tipo propio genérico (`IncomesSectionSource`),
      ya no `any[]` — resuelto en `b503317`.
- [ ] `packages/shared-ui` compila a `dist/index.js` + `dist/index.d.ts`.
- [ ] El `package.json` de `shared-ui` exporta `dist`, no `src/index.tsx`.
- [ ] Existe al menos una prueba que renderiza o verifica la estructura
      real del componente (no solo grep de palabras prohibidas).

## 05 — Composition root sin efectos secundarios (A11)

- [ ] Ya no existe `export const sqliteIncomeRepository = ...` a nivel de
      módulo.
- [ ] Ya no existe `export const localComposition = ...` a nivel de
      módulo.
- [ ] La conexión SQLite se crea mediante una factory explícita, invocada
      solo al arrancar `server/index.mjs`.
- [ ] Todos los tests que importan `@personal-tax-ledger/local-app` o
      `@personal-tax-ledger/sqlite-adapter` fijan `DB_PATH` temporal antes
      del import, o inyectan un repositorio falso sin tocar SQLite real.

## 06 — Smoke de paquetes real (A12)

- [ ] `scripts/package-smoke.mjs` importa y ejecuta
      `simulatePortfolio` desde el tarball de `core` y valida el
      resultado.
- [ ] Valida `LOCAL_WORKSPACE_CONTEXT` desde `contracts` y
      `incomeSourceRequest` desde `api-contracts`.
- [ ] Incluye el tarball de `shared-ui` construido en el paso 04.

## 07 — CI completo (A13)

- [ ] CI ejecuta `npm run architecture:check` (ya cumplido).
- [ ] CI ejecuta `npm run typecheck --if-present`.
- [ ] CI ejecuta `npm run build --workspaces --if-present`.
- [ ] CI ejecuta `npm run test --workspaces --if-present`.
- [ ] CI ejecuta `npm run smoke:local` (arranque real + healthcheck).

## 08 — DTO de ingresos completo (A04)

- [ ] `incomeSourceRequest`/`incomeSourceResponse` en `api-contracts`
      cubren todos los campos reales de `IncomeSource` (AFP, salud, APV,
      retención, notas, etc.), no solo el subconjunto mínimo original.
- [ ] `web/src/api.ts` y `server/index.mjs` usan el DTO ampliado sin
      duplicar validación.

## 09 — Validación final

- [ ] `npm test`, `npm run architecture:check`, `npm run pack:smoke`,
      `npm run smoke:local` y `vite build` (desde `web/`) verdes en una
      sola corrida.
- [ ] `docs/acceptance-matrix.md` sin criterios pendientes de alta
      prioridad.

## 10 — Cierre y desbloqueo de B00

- [ ] `docs/architecture/current-state.md` y `target-state.md`
      actualizados al estado final.
- [ ] `docs/gaps/migration-fails.md` marcado como resuelto con enlace a
      los commits de cierre.
- [ ] Decisión de desbloqueo para Paquete B registrada explícitamente.
