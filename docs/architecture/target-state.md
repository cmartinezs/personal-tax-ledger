# Estado objetivo

El estado objetivo es una arquitectura de paquetes reutilizables con dos consumidores posibles: la aplicación local y un futuro consumidor cloud. Windows no es un consumidor separado; es una plataforma de ejecución de `apps/local`.

## Capas

```text
core
  <- contracts
  <- api-contracts
  <- application
  <- sqlite-adapter       (solo local)
  <- apps/local           (composition root local)
  <- server/routes        (transporte local)
  <- web                  (cliente local)
```

Las flechas representan dependencia permitida de la capa superior hacia la inferior. `core` no depende de las demás.

## Fronteras

| Unidad | Puede conocer | No debe conocer | Responsabilidad |
|---|---|---|---|
| `core` | JavaScript estándar y datos de dominio | HTTP, React, SQLite, env, otros paquetes | Cálculos deterministas. |
| `contracts` | Tipos de contexto y contratos | HTTP, React, SQLite, otros paquetes | Puertos por agregado. |
| `api-contracts` | Datos serializables | Cálculo de negocio, SQLite, React | DTOs, filtros, errores y paginación. |
| `application` | `contracts` y collaborators inyectados | HTTP, React, SQLite | Orquestación de casos de uso. |
| `sqlite-adapter` | SQLite, `contracts`, `core` cuando necesita cálculo compartido | React y UI | Persistencia local y lifecycle. |
| `shared-ui` | React y props/callbacks abstractos | `web/src`, server, SQLite, env, fetch | Presentación reutilizable. |
| `apps/local` | Todas las capas necesarias para composición | Duplicación de dominio | Arranque, composición y runtime. |
| `web` | API contracts, servicios y shared-ui | SQL, reglas tributarias persistentes, secretos | Interfaz y coordinación de interacción. |

## Principios operativos

1. Las migraciones SQLite son idempotentes y preservan bases existentes.
2. Una conexión SQLite pertenece a una composición y tiene `close()` explícito.
3. Los DTOs públicos no importan `web`, `server` ni `apps/local`.
4. Cada paquete tiene build/test propio o una razón documentada para no tenerlo.
5. CI ejecuta los mismos checks en Ubuntu y Windows.
6. Los cambios tributarios requieren fuentes oficiales y revisión de gaps.

## Documentos relacionados

- [Estado actual](current-state.md)
- [Mapa de destinos](module-destination-map.md)
- [Política de paquetes](package-policy.md)
- [Catálogo HTTP](http-route-catalog.md)
- [Patrón de migración de agregados](aggregate-migration-pattern.md)
- [Guía de Windows](../windows-local.md)
