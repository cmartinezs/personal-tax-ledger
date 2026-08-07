# `@personal-tax-ledger/api-contracts`

DTOs serializables, filtros, errores y paginación compartidos entre frontend,
backend y consumidores externos. No contiene reglas de dominio ni dependencias
de infraestructura.

## Familias de contratos

- Incomes, boletas y gastos.
- Mortgages y registros anuales.
- Settings, bootstrap, years y referencias.
- Parámetros tributarios y fuentes oficiales.
- Snapshots, escenarios y logs.
- `ApiError` y metadatos de paginación.

Las funciones `*Request` normalizan payloads de entrada y `*Response` estabilizan
datos recibidos. No sustituyen la validación de negocio del backend.

## Verificación

```bash
npm run build --workspace @personal-tax-ledger/api-contracts
npm test --workspace @personal-tax-ledger/api-contracts
```
