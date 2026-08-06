# Matriz de aceptación — pack-a5-fix

Estado al 2026-08-06, antes de ejecutar los prompts de este paquete.
Actualiza la columna **Estado** al fusionar cada PR (`PENDIENTE` →
`EN CURSO` → `RESUELTO`), y añade el commit o PR de cierre en
**Evidencia**.

## Validación final (Prompt 09, 2026-08-06)

Corridos en una sola sesión, en este orden, sobre el repositorio con los
prompts 01-08 ya fusionados:

| # | Comando | Resultado |
|---|---|---|
| 1 | `npm test` | ✅ 67/67 |
| 2 | `npm run architecture:check` | ✅ 7 paquetes internos, sin ciclos |
| 3 | `npm run typecheck` | ❌ esperado — solo los 3 errores preexistentes de `docs/gaps/2026-08-06-tsc-web.md`; corre informativo en CI |
| 4 | `npm run build` (raíz) | ✅ |
| 5 | `npm run build:packages` | ✅ (web + shared-ui) |
| 6 | `npm run test:workspaces` | ✅ (0 tests por paquete; ver nota en el checklist) |
| 7 | `npm run pack:smoke` | ✅ |
| 8 | `npm run smoke:local` | ✅ |
| 9 | `cd web && npx --no-install vite build` | ✅ (comando de verificación de AGENTS.md) |

Confirmado además que `server/data/` no reaparece después de correr
toda esta secuencia (criterio de A11).

No quedan filas `PENDIENTE` entre los criterios bloqueantes de B00
(A03, A04, A05, A06, A12). Ver la decisión formal en el prompt 10.

| Iteración | Criterio de aceptación | Estado | Evidencia |
|---|---|---|---|
| A05 | `IncomeSourceRepository` es asíncrono (`Promise` en los 5 métodos) en `contracts`, `application` y `sqlite-adapter`. | **RESUELTO** | Prompt 01 |
| A05 | Existe una función de contract test parametrizable (`incomeSourceRepositoryContract`) en `contracts`. | **RESUELTO** | Prompt 02 (`packages/contracts/src/testing.mjs`, subpath `./testing`) |
| A06 | El test del adaptador SQLite reutiliza la suite contractual de A05, no un script ad hoc con `spawnSync`. | **RESUELTO** | Prompt 02 |
| A06 | Al menos un segundo repositorio (fake en memoria) pasa la misma suite contractual. | **RESUELTO** | Prompt 02 |
| A07 | `copyIncomeSources` pasa a formar parte del caso de uso/repositorio de ingresos, no de una función de persistencia concreta inyectada al router. | PENDIENTE (fuera de alcance) | No forma parte de los 10 prompts de este paquete; ver nota abajo. |
| A08 | El router de ingresos no recibe funciones concretas de persistencia por parámetro (solo casos de uso/servicios). | PENDIENTE (fuera de alcance) | No forma parte de los 10 prompts de este paquete; ver nota abajo. |
| A09 | `App.tsx` usa `incomeService` para las 4 operaciones de ingresos. | **RESUELTO** | `f79fdae` |
| A09 | Existe una prueba unitaria real del cliente/servicio (no solo verificación estática). | **RESUELTO** | Prompt 03 |
| A10 | `App.tsx` renderiza `IncomesSection` de `shared-ui` con el mismo comportamiento. | **RESUELTO** | `b503317` |
| A10 | `IncomesSection` usa tipos compartidos, no `any[]`. | **RESUELTO** | `b503317` (componente genérico `<T extends IncomesSectionSource>`, sin `any`) |
| A10 | `shared-ui` tiene build propio (`dist/index.js` + `.d.ts`) y exporta desde ahí. | **RESUELTO** | Prompt 04 |
| A10 | Existe una prueba que verifica el renderizado/estructura real del componente. | **RESUELTO** | Prompt 04 |
| A11 | `server/index.mjs` usa el composition root de `apps/local` en vez de reensamblar sus dependencias. | **RESUELTO** | `f0ea953` |
| A11 | El composition root no crea singletons ni abre SQLite como efecto secundario del import del módulo. | **RESUELTO** | Prompt 05 (import dinámico de `database.mjs` en `sqlite-adapter`, no solo eliminar los `export const`) |
| A12 | El smoke test ejecuta código real importado de los tarballs (no solo instalación). | **RESUELTO** | Prompt 06 (probado rompiendo un export de `core` a propósito: el smoke falla con exit code 1) |
| A12 | El tarball de `shared-ui` incluido en el smoke usa el build de `dist/`. | **RESUELTO** | Prompt 06 (usa el `dist/` empaquetado por `npm pack`, resuelto vía `renderToStaticMarkup`) |
| A13 | CI ejecuta `npm run architecture:check`. | **RESUELTO** | `c5934d9` |
| A13 | `architecture-check.mjs` detecta ciclos de dependencias reales entre paquetes internos. | **RESUELTO** | `c5934d9` |
| A13 | CI ejecuta typecheck, build y test por workspace (`--workspaces --if-present`). | **RESUELTO** | Prompt 07 |
| A13 | CI ejecuta un smoke de arranque local (`smoke:local`) con healthcheck HTTP. | **RESUELTO** | Prompt 07 |
| A04 | El DTO compartido de ingresos representa todos los campos reales (AFP, salud, APV, retención, notas). | **RESUELTO** | Prompt 08 |
| A13 (hallazgo nuevo) | `npm run build` (raíz) no falla por errores preexistentes de `tsc -b` (estaba roto desde `786073c` sin que CI lo detectara). | **RESUELTO** | Prompt 07 (`web/package.json`: `build` = solo `vite build`, `typecheck` = `tsc -b`) |

## Bloqueo de Paquete B

`docs/gaps/migration-fails.md` (sección "Decisión recomendada") fija el
criterio de bloqueo explícito: Paquete B permanece `BLOCKED` mientras
A03, A04, A05, A06 o un A12 mínimo no hayan demostrado que `core` y los
contratos pueden instalarse y consumirse desde fuera. A07, A08, A09,
A10, A11 y A13 son deseables pero no están listados como bloqueantes
por el veredicto original.

Estado de los criterios bloqueantes tras los prompts 01-08 de este
paquete: A03 ya estaba resuelto antes de esta revisión; A04, A05, A06 y
A12 quedan **RESUELTO** en la tabla de arriba. La decisión formal de
desbloqueo (o no) se registra en el prompt 10.

## Nota sobre A07/A08 (fuera de alcance de pack-a5-fix)

El paquete de corrección original propuesto en
`docs/gaps/migration-fails.md` (la estructura de 10 prompts que dio
origen a `docs/slice/pack-a5-fix/`) no incluyó un prompt dedicado a A07
(mover `copyIncomeSources` al caso de uso) ni a A08 (que el router deje
de recibir `copyIncomeSources` como función concreta). Como no son
criterios bloqueantes para B00 según el propio veredicto, quedan como
gap documentado para una iteración futura en vez de expandir el alcance
de este paquete sin que se pidiera explícitamente.
