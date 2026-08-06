# Política de paquetes

## Superficie inicial

| Paquete | Superficie estable inicial | Público futuro |
|---|---|---|
| `@personal-tax-ledger/core` | Cálculos puros, parámetros y utilidades exportados explícitamente. | Sí |
| `@personal-tax-ledger/contracts` | `WorkspaceContext`, contratos de repositorio y validadores. | Sí |
| `@personal-tax-ledger/api-contracts` | DTOs serializables de ingresos y `ApiError`. | Sí |
| `@personal-tax-ledger/shared-ui` | Sección React de ingresos basada en servicios abstractos. | Sí |
| `@personal-tax-ledger/sqlite-adapter` | Adaptador local de SQLite. | No por defecto |

Los paquetes no publican automáticamente. El consumidor debe instalar tarballs producidos localmente y no depender de rutas internas `src/`.
