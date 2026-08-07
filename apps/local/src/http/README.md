# HTTP local

Host HTTP nativo de Node. `router.mjs` conecta las rutas existentes; `read-json-body.mjs`, `http-errors.mjs` y `serve-static.mjs` contienen responsabilidades de transporte.

No cambiar aquí contratos de negocio ni SQL. Cualquier nuevo endpoint debe delegar en un caso de uso y conservar errores estructurados `{ code, message, fieldErrors? }`.

El router se crea desde [`../composition/README.md`](../composition/README.md) y se ejecuta desde [`../create-local-app.mjs`](../create-local-app.mjs).
