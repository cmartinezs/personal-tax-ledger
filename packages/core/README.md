# `@personal-tax-ledger/core`

Motor puro de cálculo tributario chileno. No depende de HTTP, React, SQLite,
variables de entorno ni otros paquetes internos.

## Qué contiene

Organizado por vertical slices en `src/features/*` y utilidades compartidas en
`src/shared/*`. Los exports públicos se conservan vía barrels raíz
(`./calculator`, `./fee-calculator`, etc.).

- `features/portfolio/calculator.mjs`: simulación anual (`simulatePortfolio`).
- `features/income/salary.mjs`: sueldos mensuales y conversión bruto/líquido.
- `features/fees/fee-calculator.mjs`: boletas, retenciones, PPM y gastos.
- `features/mortgages/mortgage-calculator.mjs`: beneficio estimado del artículo 55 bis.
- `features/apv/apv.mjs`: comparación de regímenes de APV.
- `features/scenarios/scenarios.mjs`: escenarios comparativos.
- `features/taxation/brackets.mjs` y `tax-parameters.mjs`: tabla progresiva, claves y semillas de parámetros versionados.
- `shared/calculation-explanation.mjs`, `defaults.mjs` y `util.mjs`: trazabilidad de resultados, defaults y aritmética monetaria.

## Regla de extensión

Las funciones reciben datos y devuelven resultados deterministas. No agregues lecturas de SQLite, HTTP, filesystem o `process.env`; esas responsabilidades pertenecen a application o sqlite-adapter.

## Verificación

```bash
npm run build --workspace @personal-tax-ledger/core
npm test --workspace @personal-tax-ledger/core
```
