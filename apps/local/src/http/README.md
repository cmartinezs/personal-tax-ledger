# HTTP local

Host HTTP nativo de Node. `router.mjs` conecta los routers reutilizables de
`@personal-tax-ledger/http-api`; `serve-static.mjs` sirve el frontend compilado.

No cambiar aquí contratos de negocio ni SQL. Los helpers de transporte (JSON, errores, body
parsing) viven en `@personal-tax-ledger/http-api` y se consumen desde este host.

El router se crea desde [`../composition/README.md`](../composition/README.md) y se ejecuta desde
[`../create-local-app.mjs`](../create-local-app.mjs).
