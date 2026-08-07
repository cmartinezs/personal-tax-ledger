# `@personal-tax-ledger/application`

Casos de uso asíncronos que coordinan contratos y repositorios sin conocer
HTTP, React, SQLite ni variables de entorno.

## API pública

`src/index.mjs` exporta factories para incomes, settings, logs, boletas,
gastos, mortgages, registros anuales, parámetros, fuentes, referencias, años,
snapshots y operaciones del sistema. Organización por vertical slices en
`src/features/*`.

Cada método recibe el contexto explícito cuando el agregado es privado. Los
catálogos globales usan el contrato `null` existente. Inyecta dobles en tests;
no importes un adaptador concreto dentro de este paquete.

## Verificación

```bash
npm run build --workspace @personal-tax-ledger/application
npm test --workspace @personal-tax-ledger/application
```
