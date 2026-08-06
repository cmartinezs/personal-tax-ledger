# Estado actual

## Estructura

La aplicación es un monorepo transitorio con dos superficies ejecutables:

| Ubicación | Responsabilidad actual |
|---|---|
| `server/index.mjs` | Composition root y servidor HTTP nativo: rutas, parseo JSON, validación de transporte, mapeo de errores y archivos estáticos. |
| `server/lib/*-calculator.mjs` | Cálculos puros de sueldos, honorarios e intereses hipotecarios. |
| `server/lib/calculation-explanation.mjs` | Constructores de trazabilidad de cálculos. |
| `server/lib/database.mjs` | Inicialización SQLite, esquema incremental, seeds y consultas de settings, ingresos, snapshots, parámetros y fuentes. |
| `server/lib/fee-receipts.mjs` | Persistencia y validación de boletas y gastos. |
| `server/lib/mortgages.mjs` | Persistencia y validación de créditos y registros anuales. |
| `server/lib/defaults.mjs`, `tax-parameters.mjs`, `official-sources.mjs` | Configuración tributaria, seeds y referencias oficiales. |
| `web/src/App.tsx` | Composition root React, estado de pantalla, carga de datos, navegación y parte de la presentación. |
| `web/src/api.ts` | Cliente HTTP sin contratos compartidos con el servidor. |
| `web/src/types.ts` | Tipos TypeScript exclusivos del frontend. |
| `web/src/*-module.tsx` | Secciones de boletas, créditos, escenarios, fuentes, logs y feedback. |
| `server/test/*` | Tests unitarios de cálculo, integración de persistencia y contratos básicos de simulación. |

## Flujo principal

1. `server/index.mjs` recibe `/api/simulate`.
2. Combina settings persistidos con el payload.
3. `simulatePortfolio` normaliza fuentes y coordina cálculos puros.
4. El resultado contiene totales, desglose, advertencias, explicaciones y auditoría.
5. `web/src/App.tsx` consume el resultado mediante `web/src/api.ts` y lo presenta.

## Fronteras observadas

- Los calculadores no importan HTTP, React ni SQLite.
- La persistencia SQLite es importada directamente por `server/index.mjs`.
- La validación de transporte está mezclada con el router en `server/index.mjs`.
- El frontend conoce URLs HTTP y DTOs locales.
- Los módulos de boletas e hipotecario tienen endpoints especializados y algunas previsualizaciones propias.
- No existe todavía un paquete compartido ni una interfaz de repositorio.

## Riesgos de migración

- `server/index.mjs` es el punto de acoplamiento principal.
- `database.mjs` inicializa la base al importarse; extraerlo requiere preservar `DB_PATH`, WAL y migraciones aditivas.
- Los tipos del frontend no son un contrato serializado verificable.
- Los snapshots existentes almacenan payload y resultado, por lo que cualquier migración debe conservar compatibilidad de lectura.
- La base local actual está en `server/data/apv-chile.sqlite` salvo que `DB_PATH` la sobrescriba.
