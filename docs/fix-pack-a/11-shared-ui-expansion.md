# 11 — Expansión de shared-ui

## Objetivo

Mover una segunda sección presentacional reutilizable desde `web/` a
`packages/shared-ui`, sin trasladar transporte, persistencia ni reglas locales.

## Alcance

- Extraer una sección de métricas de resumen anual basada únicamente en props.
- Usar tipos mínimos serializables y callbacks explícitos.
- Exportar el componente desde `shared-ui` y regenerar `dist/`.
- Integrarlo en `App.tsx` sin cambiar textos ni navegación.
- Añadir render tests reales con `react-dom/server`.

## Restricciones

- No importar `web/src`, `server`, SQLite, `fetch`, URLs ni variables de entorno.
- No mover la lógica de cálculo a `shared-ui`; el componente recibe resultados.
- No rediseñar la UI.

## Criterios de aceptación

- Segundo componente real exportado por `shared-ui`.
- `dist/index.js` y `dist/index.d.ts` actualizados.
- App local consume el componente.
- Tests de render y boundary pasan.
- `npm test`, `npm run build`, `pack:smoke` y `vite build` pasan.

## Commit

`refactor: expand shared-ui with reusable summary metrics`
