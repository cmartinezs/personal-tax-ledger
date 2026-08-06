# 12 — Política de paquetes públicos

## Decisión

Los paquetes que el futuro consumidor cloud necesita son públicos en cuanto
a superficie API, pero permanecen privados en npm durante esta migración:

| Paquete | Público futuro | Motivo |
|---|---:|---|
| `@personal-tax-ledger/core` | Sí | Cálculos y reglas puras reutilizables. |
| `@personal-tax-ledger/contracts` | Sí | Puertos, contextos y contract tests opcionales. |
| `@personal-tax-ledger/application` | Sí | Casos de uso que coordinan contratos sin infraestructura. |
| `@personal-tax-ledger/api-contracts` | Sí | DTOs serializables compartidos. |
| `@personal-tax-ledger/shared-ui` | Sí | Componentes React presentacionales. |
| `@personal-tax-ledger/sqlite-adapter` | No por defecto | Adaptador local específico; no es necesario para cloud. |
| `@personal-tax-ledger/local-app` | No | Composition root de la aplicación local. |

## Requisitos de empaquetado

Cada paquete futuro debe tener `files`, `exports`, build reproducible,
declaraciones cuando aplique, README, versión semántica y changelog. No se
publica realmente durante esta fase. `npm pack --dry-run` y el smoke externo
son la evidencia de consumibilidad.

## Compatibilidad

- Cambios incompatibles: versión mayor.
- Nuevos exports compatibles: versión menor.
- Correcciones internas sin cambio de contrato: versión patch.
- No se permiten imports desde `src/` en consumidores externos.

## Criterios de aceptación

- `application` tiene una superficie pública explícita y se instala desde un
  tarball.
- Los tarballs excluyen tests, datos locales y archivos no publicados.
- El smoke importa `core`, `contracts`, `application`, `api-contracts` y
  `shared-ui` desde los tarballs y ejecuta código real.

## Commit

`chore: finalize public package exports and policy`
