# Matriz de completitud

Estado consolidado después de la serie A.6-A.13. La matriz histórica de `docs/fix-pack-a` fue eliminada; esta tabla describe el código que existe actualmente y enlaza las pruebas verificables.

| Capacidad | Core | Contrato | Adapter | Application | Router | DTO | UI/servicio | Tests | Estado |
|---|---|---|---|---|---|---|---|---|---|
| Ingresos y copia anual | — | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Completa |
| Boletas y gastos | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Completa |
| Mortgages y annual records | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Completa |
| Settings/bootstrap/years | — | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Completa |
| Tax parameters/sources | — | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Completa |
| Snapshots/scenarios | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Completa |
| Execution logs/paginación | — | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Completa |
| Shell y features frontend | — | — | — | — | — | Sí | Sí | Sí | Completa |
| Shared UI y consumer smoke | — | — | — | — | — | — | Sí | Sí | Completa |
| TypeScript/CI portable | — | — | — | — | — | — | — | Sí | Completa |

## Evidencia

- `npm test` cubre integración y regresión.
- `npm run test:workspaces` ejecuta tests propios de paquetes y consumidor externo.
- `npm run build:packages` compila todos los workspaces con build.
- `npm run pack:smoke` prueba exports desde tarballs.
- `npm run typecheck`, `npm run lint` y `npm run architecture:check` protegen límites.
- `.github/workflows/ci.yml` ejecuta la certificación en Ubuntu y Windows.
