# 08 — Modularización HTTP y catálogo de rutas

## Objetivo

Convertir `server/index.mjs` en una fachada HTTP pequeña. Las rutas de
bootstrap, simulación y cálculos especializados deben depender de casos de
uso/servicios de aplicación, no de funciones concretas de `database.mjs`.

## Alcance

- Extraer el router de health/bootstrap.
- Extraer el router de simulación, comparación APV, escenarios, artículo 55 bis
  y cálculo de boletas.
- Crear casos de uso de aplicación para bootstrap y simulaciones, recibiendo
  repositorios/cálculos por factory.
- Mantener las URLs, payloads, respuestas y códigos HTTP actuales.
- Crear `docs/architecture/http-route-catalog.md` con todas las rutas actuales.
- Añadir un test de catálogo que compare las rutas declaradas contra las rutas
  esperadas y detecte pérdidas accidentales.

## Restricciones

- No introducir Express, Fastify ni otro framework HTTP.
- No cambiar reglas tributarias ni resultados numéricos.
- Los routers no deben importar `server/lib/database.mjs`, `node:sqlite` ni
  repositorios concretos.
- `server/index.mjs` puede conservar temporalmente la creación del servidor y
  el servicio estático; el composition root ejecutable completo es el paso 09.
- Bootstrap puede coordinar varios casos de uso, pero no llamar persistencia
  directamente.

## Criterios de aceptación

- `server/index.mjs` no contiene handlers inline de bootstrap, simulación,
  escenarios, artículo 55 bis, cálculo de boletas, parámetros o catálogos ya
  migrados.
- Los routers nuevos solo reciben dependencias de aplicación.
- Existe catálogo HTTP con método, path, router, caso de uso, DTO, contexto,
  éxito y errores principales.
- Existe test automático del catálogo.
- `npm test`, `architecture:check`, `build`, `pack:smoke`, `smoke:local` y
  `vite build` pasan.
- Curl verifica health, bootstrap, simulate, compare-apv, scenarios,
  article-55-bis y fee-receipt-calc.

## Commit

`refactor: modularize remaining HTTP routes and document route catalog`
