# 09 — Composition root ejecutable de apps/local

## Objetivo

Hacer que `apps/local` sea el entrypoint real de la aplicación local. `server/index.mjs`
debe quedar como fachada de compatibilidad o infraestructura HTTP reutilizable,
no como el módulo que decide todo el ensamblaje de aplicación.

## Alcance

- Crear `apps/local/src/main.mjs` con `createLocalApplication()` y `main()`.
- Mover la creación del servidor HTTP, rutas, manejo de errores y servicio estático
  a una factory reutilizable (puede vivir en `apps/local/src/http-server.mjs`).
- Conectar factories, composition, lifecycle y cierre explícito.
- Manejar `SIGINT` y `SIGTERM` con shutdown idempotente.
- Hacer que `npm start` ejecute `apps/local` directamente o mediante una fachada
  mínima documentada.
- Mantener `npm run dev`, `dev:api` y las URLs actuales.

## Restricciones

- No cambiar de framework HTTP.
- No abrir SQLite al importar `apps/local`.
- No modificar rutas o payloads.
- La base debe cerrarse en shutdown y los tests deben usar bases temporales.
- El servidor debe poder iniciarse desde una función en tests sin hacer `listen`
  automáticamente al importar.

## Criterios de aceptación

- `apps/local/src/main.mjs` es el composition root ejecutable.
- `npm start` delega en `apps/local`.
- `SIGTERM` cierra servidor y recursos sin errores ni doble cierre.
- Importar `@personal-tax-ledger/local-app` no inicia sockets ni crea base.
- Tests de health, frontend estático y shutdown.
- `npm test`, `npm run build`, `npm run smoke:local` y `vite build` pasan.

## Commit

`refactor: make apps/local the executable composition root`
