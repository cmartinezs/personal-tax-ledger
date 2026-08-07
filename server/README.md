# Backend HTTP

`server` conserva routers, utilidades de cálculo legacy compatibles y tests de integración. El host real vive en [`apps/local`](../apps/local/README.md); `server/index.mjs` es una fachada de compatibilidad.

No agregues persistencia nueva aquí. Los routers deben delegar en casos de uso y los cálculos nuevos deben vivir en `@personal-tax-ledger/core`. Consulta [`routes/README.md`](routes/README.md), [`lib/README.md`](lib/README.md) y [`test/README.md`](test/README.md).
