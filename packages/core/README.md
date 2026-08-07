# `@personal-tax-ledger/core`

Motor puro de cálculo tributario chileno. No depende de HTTP, React, SQLite,
variables de entorno ni otros paquetes internos.

## Qué contiene

- `calculator.mjs`: simulación anual y escenarios.
- `fee-calculator.mjs`: boletas, retenciones, PPM y gastos.
- `mortgage-calculator.mjs`: beneficio estimado del artículo 55 bis.
- `tax-parameters.mjs`: claves y semillas de parámetros versionados.
- `calculation-explanation.mjs`: trazabilidad de resultados.
- `defaults.mjs` y `util.mjs`: defaults y aritmética monetaria.

## Regla de extensión

Las funciones reciben datos y devuelven resultados deterministas. No agregues lecturas de SQLite, HTTP, filesystem o `process.env`; esas responsabilidades pertenecen a application o sqlite-adapter.

## Verificación

```bash
npm run build --workspace @personal-tax-ledger/core
npm test --workspace @personal-tax-ledger/core
```
