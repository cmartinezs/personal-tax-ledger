# Features

Cada subcarpeta representa un módulo funcional de la aplicación. Contiene entrypoint visual y service factory cuando necesita API. Las features no deben acoplarse a SQLite, Node ni URLs cloud.

La coordinación pura reutilizable vive en `@personal-tax-ledger/frontend-application`; aquí permanece la composición visual y el glue específico del host.

## Índice

- [`incomes/README.md`](incomes/README.md)
- [`fee-receipts/README.md`](fee-receipts/README.md)
- [`mortgages/README.md`](mortgages/README.md)
- [`scenarios/README.md`](scenarios/README.md)
- [`settings/README.md`](settings/README.md)
- [`sources/README.md`](sources/README.md)
- [`logs/README.md`](logs/README.md)
- [`bootstrap/README.md`](bootstrap/README.md)

El shell que las conecta está en [`../app/README.md`](../app/README.md).
