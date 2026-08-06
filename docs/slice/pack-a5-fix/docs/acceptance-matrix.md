# Matriz de aceptación — pack-a5-fix

Estado al 2026-08-06, antes de ejecutar los prompts de este paquete.
Actualiza la columna **Estado** al fusionar cada PR (`PENDIENTE` →
`EN CURSO` → `RESUELTO`), y añade el commit o PR de cierre en
**Evidencia**.

| Iteración | Criterio de aceptación | Estado | Evidencia |
|---|---|---|---|
| A05 | `IncomeSourceRepository` es asíncrono (`Promise` en los 5 métodos) en `contracts`, `application` y `sqlite-adapter`. | **RESUELTO** | Prompt 01 |
| A05 | Existe una función de contract test parametrizable (`incomeSourceRepositoryContract`) en `contracts`. | PENDIENTE | Se aborda en el prompt 02 (A06). |
| A06 | El test del adaptador SQLite reutiliza la suite contractual de A05, no un script ad hoc con `spawnSync`. | **RESUELTO** | Prompt 02 |
| A06 | Al menos un segundo repositorio (fake en memoria) pasa la misma suite contractual. | **RESUELTO** | Prompt 02 |
| A07 | `copyIncomeSources` pasa a formar parte del caso de uso/repositorio de ingresos, no de una función de persistencia concreta inyectada al router. | PENDIENTE | — |
| A08 | El router de ingresos no recibe funciones concretas de persistencia por parámetro (solo casos de uso/servicios). | PENDIENTE | — |
| A09 | `App.tsx` usa `incomeService` para las 4 operaciones de ingresos. | **RESUELTO** | `f79fdae` |
| A09 | Existe una prueba unitaria real del cliente/servicio (no solo verificación estática). | **RESUELTO** | Prompt 03 |
| A10 | `App.tsx` renderiza `IncomesSection` de `shared-ui` con el mismo comportamiento. | **RESUELTO** | `b503317` |
| A10 | `IncomesSection` usa tipos compartidos, no `any[]`. | **RESUELTO** | `b503317` (componente genérico `<T extends IncomesSectionSource>`, sin `any`) |
| A10 | `shared-ui` tiene build propio (`dist/index.js` + `.d.ts`) y exporta desde ahí. | PENDIENTE | — |
| A10 | Existe una prueba que verifica el renderizado/estructura real del componente. | PENDIENTE | — |
| A11 | `server/index.mjs` usa el composition root de `apps/local` en vez de reensamblar sus dependencias. | **RESUELTO** | `f0ea953` |
| A11 | El composition root no crea singletons ni abre SQLite como efecto secundario del import del módulo. | PENDIENTE | — |
| A12 | El smoke test ejecuta código real importado de los tarballs (no solo instalación). | PENDIENTE | — |
| A12 | El tarball de `shared-ui` incluido en el smoke usa el build de `dist/`. | PENDIENTE | — |
| A13 | CI ejecuta `npm run architecture:check`. | **RESUELTO** | `c5934d9` |
| A13 | `architecture-check.mjs` detecta ciclos de dependencias reales entre paquetes internos. | **RESUELTO** | `c5934d9` |
| A13 | CI ejecuta typecheck, build y test por workspace (`--workspaces --if-present`). | PENDIENTE | — |
| A13 | CI ejecuta un smoke de arranque local (`smoke:local`) con healthcheck HTTP. | PENDIENTE | — |
| A04 | El DTO compartido de ingresos representa todos los campos reales (AFP, salud, APV, retención, notas). | PENDIENTE | — |

## Bloqueo de Paquete B

Mientras existan filas `PENDIENTE` en A05, A06 o A12, el Paquete B
(repositorio cloud) permanece `BLOCKED` según la decisión registrada en
`docs/gaps/migration-fails.md`.
