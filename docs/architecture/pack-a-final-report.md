# Informe final del Pack A

## Veredicto

```text
PACK_A_PARTIAL
```

El backend local y las fronteras de persistencia quedaron ampliamente
migrados: todos los agregados principales tienen contratos, adaptadores
SQLite, casos de uso y routers, y `apps/local` es el entrypoint ejecutable.
Sin embargo, no se puede declarar `PACK_A_COMPLETE` porque la Definition of
Done exige todavía:

- DTOs compartidos para todos los módulos frontend;
- servicios frontend completos para settings, tax parameters, snapshots,
  years y bootstrap;
- componentes de esos módulos en `shared-ui` cuando sean reutilizables;
- reducción completa de la lógica funcional de `App.tsx`;
- extracción de `serveStatic` y un lifecycle HTTP completamente separado de
  `server/index.mjs`;
- tests por workspace reales, no solo scripts `node --test` que reportan cero
  tests dentro de cada paquete;
- cierre del gap de `tsc -b` de `web/`.

El resultado es una migración backend sólida y verificable, pero no una
finalización del Pack A al 100% según el checklist solicitado.

## Commits de esta ejecución

| Commit | Objetivo |
|---|---|
| `4f4448d` | Descubrimiento y matriz inicial de capacidades. |
| `3af7342` | Copia de ingresos por caso de uso. |
| `b6596cf` | Settings por contrato/adaptador/caso de uso/router. |
| `8e4f90c` | Execution logs por capas. |
| `1ae6e83` | Fee receipts y gastos de honorarios. |
| `4ba8d0b` | Mortgages y registros anuales. |
| `4bfd5bf` | Tax parameters y tax rule sources. |
| `6466377` | References, years y snapshots. |
| `10cd695` | Corrección documental del paso 07. |
| `b04e89b` | Modularización HTTP y catálogo de rutas. |
| `6c8f950` | `apps/local` como entrypoint y shutdown. |
| `36a1923` | Servicios frontend por módulo. |
| `f11c5bc` | `SummaryMetrics` en shared-ui. |
| `cf86fc4` | Política pública de paquetes y smoke de application. |
| `bb1bbce` | CI, `validate:pack-a` y fachadas transitorias. |

## Arquitectura entregada

### Contratos

Contratos asíncronos y específicos para:

- ingresos;
- settings;
- execution logs;
- fee receipts;
- fee expense settings;
- mortgages;
- mortgage annual records;
- tax parameters;
- tax rule sources;
- references;
- years;
- snapshots.

Las suites contractuales y asserts están exportados desde
`@personal-tax-ledger/contracts`.

### Adaptadores

`packages/sqlite-adapter` contiene factories diferidas para los agregados.
Los imports de módulos SQLite se ejecutan solo al invocar métodos reales, no
al importar los paquetes.

### Application

`packages/application` contiene casos de uso para los agregados migrados,

### HTTP

Routers extraídos para:

- system/bootstrap/health;
- ingresos;
- settings;
- logs;
- fee receipts;
- gastos de honorarios;
- mortgages;
- tax parameters;
- tax rule sources;
- snapshots/years/references;
- simulaciones.

El catálogo está en `docs/architecture/http-route-catalog.md`.

### Frontend

Se crearon servicios inyectables para fee receipts, mortgages, scenarios,
sources y logs. `App.tsx` todavía conserva coordinación y estado global de
varios módulos.

### Shared UI

`shared-ui` contiene `IncomesSection` y `SummaryMetrics`, con build a `dist`,
declaraciones y render tests reales.

### Local app

`apps/local/src/main.mjs` es el entrypoint de `npm start`, controla

## Verificaciones

| Comando | Resultado |
|---|---|
| `npm ci` | PASS |
| `npm test` | PASS — 83 tests |
| `npm run architecture:check` | PASS |
| `npm run build` | PASS |
| `npm run build:packages` | PASS |
| `npm run test:workspaces` | PASS, pero los paquetes reportan 0 tests propios |
| `npm run pack:dry-run` | PASS |
| `npm run pack:smoke` | PASS — 5 tarballs, incluyendo `application` |
| `npm run smoke:local` | PASS |
| `npm run validate:pack-a` | PASS |
| `cd web && npx --no-install vite build` | PASS |
| `npm run typecheck` | FAIL informativo por 3 errores preexistentes documentados |

## Fachadas restantes

El inventario completo está en `docs/architecture/transitional-facades.md`.
Las principales son:

- `server/index.mjs`: todavía crea servidor y sirve estáticos; debe extraerse
  a infraestructura HTTP de `apps/local`.
- `server/lib/database.mjs`: esquema/migraciones y funciones legacy aún
  consumidas por adaptadores diferidos y cálculos restantes.
- `server/lib/fee-receipts.mjs` y `server/lib/mortgages.mjs`: contienen SQL,
  sanitización y coordinación heredada.
- `web/src/api.ts`: objeto HTTP monolítico que todavía convive con servicios
  de módulo.
- `web/src/incomes-section.tsx`: reexport local de shared-ui.
- Reexports de calculadores en `server/lib`.

## Riesgos residuales

- Cambiar `server/lib/database.mjs` a una factory global requiere preservar
  migraciones, WAL, foreign keys y compatibilidad de bases existentes.
- Los DTOs de fee receipts, mortgages, settings y tax catalogs siguen siendo
  tipos locales del frontend.
- `App.tsx` sigue siendo demasiado grande para una aplicación completamente
  ensamblada por módulos.
- El test por workspace no descubre los tests ubicados en `server/test`.
- `tsc -b` de web sigue teniendo los errores registrados en
  `docs/gaps/2026-08-06-tsc-web.md`.
- `POST /api/logs` conserva la inconsistencia histórica de devolver columnas
  snake_case, mientras GET devuelve camelCase; quedó documentada en
  `docs/fix-pack-a/00-discovery.md`.

## Siguiente trabajo

Para llegar a `PACK_A_COMPLETE` faltan como mínimo:

1. DTOs compartidos y servicios frontend para los agregados restantes.
2. Extracción de páginas/módulos y reducción efectiva de `App.tsx`.
3. Componentes reutilizables adicionales en `shared-ui`.
4. Extracción de infraestructura HTTP y estáticos de `server/index.mjs`.
5. Tests propios dentro de los paquetes o una estrategia workspace que
   ejecute los tests reales.
6. Resolución del typecheck de web.

No se inicia el Pack B como sustituto de estos pendientes; este informe deja
el estado real explícito.
