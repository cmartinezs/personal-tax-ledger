# Código del adaptador SQLite

Los archivos `*-repository.mjs` implementan contratos; `database/` contiene conexión, migraciones y persistencia concreta. Los repositorios aceptan un delegate para tests y una base explícita para producción.

No mover reglas de cálculo a este nivel. Las validaciones que pertenecen a la forma persistida pueden vivir junto al agregado, pero los cálculos puros pertenecen a `@personal-tax-ledger/core`.

Consulta [`database/README.md`](database/README.md) para SQL/lifecycle y [`../test/README.md`](../test/README.md) para pruebas.
