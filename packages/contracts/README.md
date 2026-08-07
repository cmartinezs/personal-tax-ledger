# `@personal-tax-ledger/contracts`

Contratos asíncronos por agregado, `WorkspaceContext` y asserts runtime.

## API

El export principal contiene contratos de incomes, settings, logs, boletas,
gastos, mortgages, catálogos, referencias, años y snapshots. Cada contrato
define métodos obligatorios; no reutilices el contrato de otro agregado.
Organización por vertical slices en `src/features/*` y `WorkspaceContext` en
`src/shared/`.

`@personal-tax-ledger/contracts/testing` contiene suites reutilizables para
validar adaptadores contra una base o doble de prueba.

## Verificación

```bash
npm run build --workspace @personal-tax-ledger/contracts
npm test --workspace @personal-tax-ledger/contracts
```
