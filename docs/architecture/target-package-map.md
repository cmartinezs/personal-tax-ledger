# Mapa objetivo de packages y vertical slices

Este documento define dónde debe vivir cada responsabilidad en la arquitectura Clean/Hexagonal
objetivo (ADR-0001). No es un reflejo del estado actual: para eso consulta
[`current-state.md`](current-state.md) y [`module-destination-map.md`](module-destination-map.md).

## Estructura de packages objetivo

```text
packages/
├── domain/              # hoy core
├── ports/               # hoy contracts
├── application/
├── api-contracts/
├── http-api/
├── sqlite-adapter/
├── frontend-application/
└── shared-ui/
```

Los nombres `domain/` y `ports/` son decisiones de A16; hasta entonces `core` y `contracts`
conservan sus exports actuales.

## Mapa de features por capa

Cada feature se mapea a las siete capas. Ninguna capa de un feature debe quedar fuera de su
vertical slice.

### Ingresos

| Capa | Destino |
|---|---|
| Domain | `core`: validación y normalización de `income source` |
| Port | `contracts`: `IncomeRepository` y contrato de `income source` |
| Use Case | `application`: `createIncomeUseCases` |
| HTTP inbound | `http-api`: router de `/api/incomes` |
| Persistence outbound | `sqlite-adapter`: `IncomeRepository` sobre SQLite |
| Frontend application | `frontend-application`: servicio de ingresos |
| Shared UI | `shared-ui`: `IncomesSection` |

### Boletas (fee receipts)

| Capa | Destino |
|---|---|
| Domain | `core`: cálculo de boletas y gastos anuales |
| Port | `contracts`: `FeeReceiptRepository`, `FeeExpenseSettingsRepository` |
| Use Case | `application`: `createFeeReceiptUseCases`, `createFeeExpenseSettingsUseCases` |
| HTTP inbound | `http-api`: router de `/api/fee-receipts` y `/api/fee-expense-settings` |
| Persistence outbound | `sqlite-adapter`: repositorios de boletas y gastos |
| Frontend application | `frontend-application`: servicio de boletas |
| Shared UI | `shared-ui`: módulo de boletas |

### Hipotecarios (mortgages)

| Capa | Destino |
|---|---|
| Domain | `core`: cálculo hipotecario y art. 55 bis |
| Port | `contracts`: `MortgageRepository`, `MortgageAnnualRecordRepository` |
| Use Case | `application`: `createMortgageUseCases`, `createMortgageAnnualRecordUseCases` |
| HTTP inbound | `http-api`: router de `/api/mortgages` |
| Persistence outbound | `sqlite-adapter`: repositorios de loans y annual records |
| Frontend application | `frontend-application`: servicio de mortgages |
| Shared UI | `shared-ui`: módulo de mortgages |

### Escenarios y APV

| Capa | Destino |
|---|---|
| Domain | `core`: `simulatePortfolio`, `compareApv`, `buildScenarios` |
| Port | `contracts`: contexto de workspace |
| Use Case | `application`: casos de simulación y APV |
| HTTP inbound | `http-api`: router de `/api/simulate`, `/api/compare-apv`, `/api/scenarios` |
| Persistence outbound | `sqlite-adapter`: snapshots |
| Frontend application | `frontend-application`: servicio de escenarios |
| Shared UI | `shared-ui`: módulo de escenarios |

### Settings

| Capa | Destino |
|---|---|
| Domain | `core`: `defaultSettings` y validación |
| Port | `contracts`: `SettingsRepository` |
| Use Case | `application`: `createSettingsUseCases` |
| HTTP inbound | `http-api`: router de `/api/settings` |
| Persistence outbound | `sqlite-adapter`: `SettingsRepository` |
| Frontend application | `frontend-application`: servicio de settings |
| Shared UI | `shared-ui`: módulo de settings |

### Catálogos tributarios (tax)

| Capa | Destino |
|---|---|
| Domain | `core`: parámetros tributarios versionados |
| Port | `contracts`: `TaxParameterRepository`, `TaxRuleSourceRepository` |
| Use Case | `application`: `createTaxParameterUseCases`, `createTaxRuleSourceUseCases` |
| HTTP inbound | `http-api`: routers de `/api/tax-parameters` y `/api/tax-rule-sources` |
| Persistence outbound | `sqlite-adapter`: repositorios de catálogos |
| Frontend application | `frontend-application`: servicio de fuentes y parámetros |
| Shared UI | `shared-ui`: módulo de fuentes |

### Snapshots

| Capa | Destino |
|---|---|
| Domain | `core`: estructura de snapshot |
| Port | `contracts`: `SnapshotRepository` |
| Use Case | `application`: `createSnapshotUseCases` |
| HTTP inbound | `http-api`: router de `/api/snapshots` |
| Persistence outbound | `sqlite-adapter`: repositorio de snapshots |
| Frontend application | `frontend-application`: servicio de snapshots |
| Shared UI | `shared-ui`: (se conserva donde exista) |

### Years y referencias

| Capa | Destino |
|---|---|
| Domain | `core`: año tributario |
| Port | `contracts`: `YearRepository`, `ReferenceRepository` |
| Use Case | `application`: `createYearUseCases`, `createReferenceUseCases` |
| HTTP inbound | `http-api`: routers de `/api/years` y `/api/references` |
| Persistence outbound | `sqlite-adapter`: repositorios de years y referencias |
| Frontend application | `frontend-application`: servicio de bootstrap |
| Shared UI | `shared-ui`: (depende del host) |

### Logs de ejecución

| Capa | Destino |
|---|---|
| Domain | `core`: modelo de execution log |
| Port | `contracts`: `ExecutionLogRepository` |
| Use Case | `application`: `createExecutionLogUseCases` |
| HTTP inbound | `http-api`: router de `/api/logs` |
| Persistence outbound | `sqlite-adapter`: `ExecutionLogRepository` |
| Frontend application | `frontend-application`: servicio de logs |
| Shared UI | `shared-ui`: módulo de logs |

### Bootstrap y health

| Capa | Destino |
|---|---|
| Domain | `core`: sin lógica de negocio |
| Port | `contracts`: contexto |
| Use Case | `application`: `createSystemUseCases` |
| HTTP inbound | `http-api`: routers de `/api/bootstrap`, `/api/health`, `/api/simulate` y cálculos auxiliares |
| Persistence outbound | `sqlite-adapter`: composición de repositorios |
| Frontend application | `frontend-application`: bootstrap del host |
| Shared UI | `shared-ui`: shell reutilizable |

## Reglas de migración

- Cada feature se mueve como vertical slice completa; no se dejan capas huérfanas.
- Los routers migran en el orden de los packs A15 (core -> financial -> support).
- `apps/local` consume adapters y packages; no aloja lógica reusable.
- Un módulo productivo sin destino en este mapa es un gap que debe resolverse antes de su extracción.

## Verificación

Este mapa se valida contra archivos reales en cada pack de A15-A17. Ningún módulo productivo
puede quedar sin destino después de A15.5.
