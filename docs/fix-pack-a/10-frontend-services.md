# 10 — Servicios frontend por módulo

## Objetivo

Separar el transporte HTTP de los módulos React restantes sin rediseñar la UI
ni introducir un framework de estado. Cada módulo debe consumir un servicio
tipado e inyectable, en vez de depender directamente del objeto global `api`.

## Alcance de esta iteración

- Crear servicios para `feeReceipts`, `mortgages`, `settings`, `scenarios`,
  `taxParameters`, `taxRuleSources` y `executionLogs`.
- Mantener `incomeService` existente.
- Exportar un `frontendServices` agrupado desde `web/src/services.ts`.
- Cambiar los módulos React para recibir el servicio relevante por props,
  con fallback al servicio local para conservar compatibilidad visual y de
  navegación.
- Añadir tests unitarios de delegación para servicios sin DOM.

## Fuera de alcance

- No mover todavía todos los estados de `App.tsx` a providers.
- No rediseñar la UI.
- No introducir Redux, Zustand, React Query ni otro framework.
- No mover componentes a `shared-ui` en esta iteración; será el paso 11.

## Criterios de aceptación

- Los módulos ya no importan directamente el objeto `api` global.
- Cada servicio encapsula sus llamadas HTTP y es reemplazable por un fake.
- `App.tsx` conserva comportamiento observable y navegación.
- Tests de delegación, `npm test`, `npm run build`, `vite build` y smoke local
  pasan.

## Commit

`refactor: introduce typed frontend services per module`
