# Personal Tax Ledger — Clean/Hexagonal Packs A14–A18

Esta serie lleva el repositorio desde su estado actual hacia una arquitectura Clean/Hexagonal reusable, usando `grade-ops-ai/api/src` como guía conceptual sin copiar su estructura Java literalmente.

## Objetivo final

```text
apps/local ─┐
            ├── packages/*
apps/cloud ─┘
```

La aplicación local y la futura aplicación cloud son hosts. El dominio, casos de uso, ports, adapter HTTP reusable y frontend reusable viven en packages independientes.

## Packs

- **A14 — Architecture foundation:** ADR, reglas de dependencia, mapa objetivo y guardrails.
- **A15 — Backend inbound adapter:** `packages/http-api`, migración de routers y eliminación de `server/`.
- **A16 — Inner hexagon:** Domain/Core, Ports/Contracts y Application por vertical slices.
- **A17 — Frontend reuse + local host:** `frontend-application`, extracción de coordinación reusable y movimiento de `web/` a `apps/local/web`.
- **A18 — Certification:** consumer externo, eliminación de fachadas, CI final y readiness cloud.

## Regla de ejecución

Ejecutar un solo MD por vez. Cada MD valida sus dependencias, reporta `MD_EXECUTED` y no continúa automáticamente.

## Criterio final

Un consumidor externo debe poder usar la funcionalidad reusable sin importar ni copiar:

```text
server/
apps/local/
packages/sqlite-adapter/
```

`sqlite-adapter` pertenece al host local. El host cloud deberá aportar su propio outbound adapter de persistencia.

Windows sigue siendo una plataforma de ejecución de `apps/local`, no una app separada.

## Secuencia

1. `packs/A14/01-architecture-decision.md` — Pack A14.1 — Decisión arquitectónica Clean/Hexagonal
2. `packs/A14/02-dependency-rules.md` — Pack A14.2 — Reglas de dependencias y fronteras
3. `packs/A14/03-target-package-map.md` — Pack A14.3 — Mapa objetivo de packages y vertical slices
4. `packs/A14/04-architecture-guardrails.md` — Pack A14.4 — Guardrails de arquitectura objetivo
5. `packs/A15/01-create-http-api-package.md` — Pack A15.1 — Crear inbound adapter `http-api`
6. `packs/A15/02-migrate-http-routes-core-features.md` — Pack A15.2 — Migrar routers de ingresos, settings y logs
7. `packs/A15/03-migrate-http-routes-financial-features.md` — Pack A15.3 — Migrar routers de boletas e hipotecarios
8. `packs/A15/04-migrate-http-routes-support-features.md` — Pack A15.4 — Migrar routers de tax, snapshots, years y simulación
9. `packs/A15/05-remove-server-root.md` — Pack A15.5 — Eliminar `server/` como root arquitectónico
10. `packs/A16/01-domain-and-ports-decision.md` — Pack A16.1 — Normalizar `core/domain` y `contracts/ports`
11. `packs/A16/02-organize-domain-by-feature.md` — Pack A16.2 — Organizar Domain por vertical slices
12. `packs/A16/03-organize-ports-by-feature.md` — Pack A16.3 — Organizar Ports por vertical slices
13. `packs/A16/04-organize-application-by-feature.md` — Pack A16.4 — Organizar Application por vertical slices
14. `packs/A16/05-inner-hexagon-certification.md` — Pack A16.5 — Certificar el inner hexagon
15. `packs/A17/01-create-frontend-application-package.md` — Pack A17.1 — Crear `frontend-application`
16. `packs/A17/02-migrate-frontend-services.md` — Pack A17.2 — Migrar servicios frontend reutilizables
17. `packs/A17/03-migrate-feature-coordination.md` — Pack A17.3 — Extraer coordinación reusable de features
18. `packs/A17/04-move-local-web-under-app.md` — Pack A17.4 — Mover React local a `apps/local/web`
19. `packs/A17/05-frontend-host-certification.md` — Pack A17.5 — Certificar separación frontend host/reuse
20. `packs/A18/01-cloud-readiness-consumer.md` — Pack A18.1 — Consumer de readiness cloud
21. `packs/A18/02-remove-transitional-roots-and-facades.md` — Pack A18.2 — Eliminar fachadas y roots transitorios restantes
22. `packs/A18/03-ci-architecture-final.md` — Pack A18.3 — CI final de Clean/Hexagonal
23. `packs/A18/04-final-certification.md` — Pack A18.4 — Certificación final y cierre
