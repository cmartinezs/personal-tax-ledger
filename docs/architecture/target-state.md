# Estado objetivo

La migración será incremental. La aplicación local seguirá ejecutándose con Node HTTP, React, Vite y SQLite, mientras los paquetes reutilizables se extraen detrás de adaptadores.

```text
personal-tax-ledger/
├── apps/local/                 # ensamblaje local futuro
├── packages/
│   ├── core/                   # reglas y cálculos puros
│   ├── contracts/              # puertos de repositorios y contexto
│   ├── api-contracts/          # DTOs HTTP y errores serializados
│   ├── shared-ui/              # UI React reutilizable
│   └── sqlite-adapter/         # implementación local de contratos
├── server/                     # fachada/transición mientras se migra
└── web/                        # fachada/transición mientras se migra
```

## Fronteras

| Frontera | Puede importar | No puede importar | Responsabilidad |
|---|---|---|---|
| `core` | TypeScript/JavaScript estándar y utilidades de dominio | Node HTTP, React, SQLite, Supabase, Firebase, env | Cálculos deterministas y reglas tributarias. |
| `contracts` | Tipos de dominio y contexto | HTTP, React, SQLite | Puertos por agregado y `WorkspaceContext`. |
| `api-contracts` | Tipos serializables y validación compatible | Cálculo de dominio, SQLite, React | Requests, responses, filtros y errores HTTP. |
| `shared-ui` | React, contratos y servicios abstractos | Firebase, Supabase, SQLite, URLs de despliegue | Componentes y páginas reutilizables. |
| `sqlite-adapter` | SQLite y contratos | React y core inverso | Implementación local de repositorios y migraciones. |
| `apps/local` | Todos los adaptadores y composición local | Reglas duplicadas | Ensamblaje de API, persistencia, autenticación local y frontend. |

## Contexto de propietario

Los casos de uso privados recibirán un `WorkspaceContext`. La aplicación local usará `workspaceId = "local-workspace"` y `actorId = "local-user"`. Los catálogos tributarios globales no requieren propietario.

## Principios de compatibilidad

- Los calculadores seguirán siendo independientes de infraestructura.
- Las URLs y respuestas existentes se mantienen durante la transición.
- Los adaptadores temporales se eliminan únicamente cuando no tengan consumidores.
- Las migraciones SQLite serán incrementales e idempotentes.
- El archivo local continuará en `server/data/apv-chile.sqlite` hasta contar con migración y rollback probados.
