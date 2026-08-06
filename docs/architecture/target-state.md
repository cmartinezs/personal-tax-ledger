# Estado objetivo

La migración será incremental. La aplicación local seguirá ejecutándose con Node HTTP, React, Vite y SQLite, mientras los paquetes reutilizables se extraen detrás de adaptadores.

```text
personal-tax-ledger/
├── apps/local/                 # composition root local real (usado por server/index.mjs)
├── packages/
│   ├── core/                   # reglas y cálculos puros
│   ├── contracts/              # puertos de repositorios y contexto
│   ├── api-contracts/          # DTOs HTTP y errores serializados
│   ├── application/            # casos de uso que coordinan contracts + repositorios
│   ├── shared-ui/              # UI React reutilizable
│   └── sqlite-adapter/         # implementación local de contratos
├── server/                     # fachada/transición mientras se migra
└── web/                        # fachada/transición mientras se migra
```

## Fronteras

| Frontera | Puede importar | No puede importar | Responsabilidad |
|---|---|---|---|
| `core` | TypeScript/JavaScript estándar y utilidades de dominio | Node HTTP, React, SQLite, Supabase, Firebase, env, otros paquetes internos | Cálculos deterministas y reglas tributarias. |
| `contracts` | Tipos de dominio y contexto | HTTP, React, SQLite, otros paquetes internos | Puertos por agregado y `WorkspaceContext`. |
| `api-contracts` | Tipos serializables y validación compatible | Cálculo de dominio, SQLite, React | Requests, responses, filtros y errores HTTP. |
| `application` | `contracts` | HTTP, React, SQLite | Casos de uso que exigen `WorkspaceContext` y delegan en repositorios. |
| `shared-ui` | React, contratos y servicios/callbacks abstractos | Firebase, Supabase, SQLite, URLs de despliegue, `fetch` directo | Componentes y páginas reutilizables, presentacionales (reciben datos y acciones por props). |
| `sqlite-adapter` | SQLite y contratos | React y core inverso | Implementación local de repositorios y migraciones. |
| `apps/local` | Todos los adaptadores y composición local | Reglas duplicadas | Ensamblaje real de casos de uso y routers; `server/index.mjs` lo consume en vez de reensamblar sus propias dependencias. |

`scripts/architecture-check.mjs` (corrido en CI vía `npm run architecture:check`) construye el grafo real de dependencias entre `packages/*` y `apps/*` a partir de sus imports, detecta ciclos y verifica que `core`/`contracts` no dependan de ningún otro paquete interno.

## Contexto de propietario

Los casos de uso privados recibirán un `WorkspaceContext`. La aplicación local usará `workspaceId = "local-workspace"` y `actorId = "local-user"`. Los catálogos tributarios globales no requieren propietario.

## Principios de compatibilidad

- Los calculadores seguirán siendo independientes de infraestructura.
- Las URLs y respuestas existentes se mantienen durante la transición.
- Los adaptadores temporales se eliminan únicamente cuando no tengan consumidores.
- Las migraciones SQLite serán incrementales e idempotentes.
- El archivo local continuará en `server/data/apv-chile.sqlite` hasta contar con migración y rollback probados.
