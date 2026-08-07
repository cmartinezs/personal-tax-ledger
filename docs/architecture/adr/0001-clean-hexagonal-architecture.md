# ADR-0001: Arquitectura Clean/Hexagonal

Fecha: 2026-08-06
Estado: Aceptado
Serie: A14-A18 Clean/Hexagonal

## Contexto

El monorepo creció de forma orgánica. Hoy existen roots transitorios (`server/` y `web/`) que
duplican responsabilidades que ya viven en `packages/*`, y el host local (`apps/local`) depende
de código productivo fuera de packages. Esto impide que un futuro host cloud (o cualquier otro
host) reutilice la funcionalidad sin copiar o importar código local.

Referencias: `packages/*`, `server/routes`, `apps/local`, `web/src`.

## Decisión

Adoptar Clean Architecture y Hexagonal Architecture como arquitectura objetivo, usando
`grade-ops-ai/api/src` solo como guía conceptual (no se copia su estructura Java literal).

### Responsabilidades

- **Domain (Core):** entidades, value objects y cálculos puros. Sin I/O, sin HTTP, sin React,
  sin persistencia.
- **Application:** casos de uso (use cases) que orquestan Domain y ports. Reciben dependencias
  inyectadas. Sin HTTP ni persistencia.
- **Ports (Contracts):** interfaces hacia afuera (repositorios, contexto) definidas hacia adentro.
  Sin implementación concreta.
- **Inbound adapters:** adaptadores de entrada que traducen protocolos (HTTP, UI) a llamadas de
  aplicación. Viven en packages reusables.
- **Outbound adapters:** adaptadores de salida (persistencia, servicios externos). Viven en
  packages reusables o en el host.
- **Hosts:** composición root y runtime. `apps/local` y futuro `apps/cloud`.

### Estructura objetivo

```text
apps/local ─┐
            ├── packages/*
apps/cloud ─┘
```

### Roots transitorios

`server/` y `web/` son roots transitorios a eliminar en esta serie. No se permite que nuevos
packages reusables dependan de ellos.

## Alternativas consideradas

- Mantener el estado actual: descartado porque bloquea el reuse cloud y duplica routers.
- Migración brusca (mover todo de golpe): descartada; se ejecuta en packs con validación tras cada paso.

## Consecuencias

- La dirección de dependencias queda definida: packages reusables no dependen de hosts ni roots
  legacy.
- Windows sigue siendo una plataforma de ejecución de `apps/local`, no una aplicación separada.
- Se preserva comportamiento observable: rutas HTTP, payloads, resultados tributarios y
  compatibilidad de datos.

## Estado actual vs objetivo

- Estado actual: routers HTTP en `server/routes`, host local importa desde `server/`, frontend en
  root `web/`.
- Estado objetivo: inbound HTTP en `packages/http-api`, frontend reutilizable en
  `packages/frontend-application` + `packages/shared-ui`, frontend del host bajo `apps/local`,
  `server/` y `web/` eliminados.
