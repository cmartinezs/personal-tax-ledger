# Checklist de migración — pack-a5-fix

Marca cada casilla al fusionar el PR correspondiente. No avances al
siguiente prompt sin marcar el anterior.

## 01 — Contrato de repositorio asíncrono (A05)

- [x] `IncomeSourceRepository` en `packages/contracts` tipado con
      `Promise<...>` en los cinco métodos.
- [x] `packages/application` usa `async`/`await` en todos los casos de uso.
- [x] `packages/sqlite-adapter` envuelve las llamadas síncronas de
      `node:sqlite` en funciones `async`.
- [x] `server/routes/incomes.mjs` usa `await` en cada llamada a los casos
      de uso (ya es un handler `async`).
- [x] Todos los tests que llaman al repositorio/casos de uso usan
      `await`.
- [x] `npm test` y `npm run architecture:check` verdes.

## 02 — Suite de contract tests reutilizable (A06)

- [x] Existe `incomeSourceRepositoryContract(createRepository, createContext)`
      exportado desde `packages/contracts` (subpath `./testing`).
- [x] `server/test/sqlite-adapter-contract.test.mjs` reemplaza el script
      ad hoc por la suite reutilizable.
- [x] Existe al menos un segundo repositorio (fake en memoria) que pasa
      la misma suite, demostrando reutilización real.

## 03 — Cierre formal de la integración de ingresos (A09)

- [x] Prueba unitaria real de `income-service.ts` (con un cliente falso),
      no solo verificación estática de texto (Node 24 importa `.ts` con
      type stripping nativo, sin herramientas nuevas).
- [x] Confirmado que las 4 operaciones (list/create/update/remove) usan
      el servicio end-to-end (test dedicado + registro de ejecución).

## 04 — shared-ui con build propio (A10)

- [x] `IncomesSection` usa un tipo propio genérico (`IncomesSectionSource`),
      ya no `any[]` — resuelto en `b503317`.
- [x] `packages/shared-ui` compila a `dist/index.js` + `dist/index.d.ts`
      (`tsc`, ver `packages/shared-ui/tsconfig.json`).
- [x] El `package.json` de `shared-ui` exporta `dist`, no `src/index.tsx`.
- [x] Existe al menos una prueba que renderiza o verifica la estructura
      real del componente (no solo grep de palabras prohibidas):
      `server/test/shared-ui-render.test.mjs` con `react-dom/server`.

## 05 — Composition root sin efectos secundarios (A11)

- [x] Ya no existe `export const sqliteIncomeRepository = ...` a nivel de
      módulo.
- [x] Ya no existe `export const localComposition = ...` a nivel de
      módulo.
- [x] `packages/sqlite-adapter` ya no importa `server/lib/database.mjs`
      de forma estática: usa `import()` dinámico, memorizado, invocado
      solo dentro de cada método async del repositorio (la causa real
      del efecto secundario era este import, no los `export const`).
- [x] Todos los tests que importan `@personal-tax-ledger/local-app` o
      `@personal-tax-ledger/sqlite-adapter` fijan `DB_PATH` temporal antes
      del import, o inyectan un repositorio falso sin tocar SQLite real.
- [x] `npm test` ya no recrea `server/data/apv-chile.sqlite` (verificado
      borrando el directorio antes de correr la suite).

## 06 — Smoke de paquetes real (A12)

- [x] `scripts/package-smoke.mjs` importa y ejecuta
      `simulatePortfolio` desde el tarball de `core` y valida el
      resultado.
- [x] Valida `LOCAL_WORKSPACE_CONTEXT` desde `contracts` y
      `incomeSourceRequest` desde `api-contracts`.
- [x] Incluye el tarball de `shared-ui` construido en el paso 04,
      renderizado con `react-dom/server` en un consumidor real.

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
