# Catálogo HTTP

La implementación del host está en [`apps/local/src/http`](../../apps/local/src/http/README.md); los routers delegables están en [`packages/http-api`](../../packages/http-api/README.md).

| Método | Path | Router | Caso de uso/servicio | Éxito | Errores principales |
|---|---|---|---|---:|---|
| GET | `/api/health` | `system` | `systemUseCases.health` | 200 | — |
| GET | `/api/bootstrap` | `system` | `systemUseCases.bootstrap` | 200 | — |
| GET | `/api/years` | `system` | `systemUseCases.listYears` | 200 | — |
| GET/POST | `/api/logs` | `execution-logs` | `listExecutionLogs` / `createExecutionLog` | 200/201 | 400 validation |
| PUT | `/api/settings` | `settings` | `updateSettings` | 200 | 400 |
| GET/POST | `/api/incomes` | `incomes` | `listIncomeSources` / `createIncomeSource` | 200/201 | 400 |
| POST | `/api/incomes/copy` | `incomes` | `copyIncomeSources` | 201 | 409 destino existente |
| PUT/DELETE | `/api/incomes/:id` | `incomes` | `updateIncomeSource` / `deleteIncomeSource` | 200/204 | 400/404 |
| GET/PUT | `/api/tax-parameters` | `tax-parameters` | `listTaxParameters` / `upsertTaxParameter` | 200 | 400 |
| GET/POST | `/api/tax-rule-sources` | `tax-rule-sources` | `listTaxRuleSources` / `upsertTaxRuleSource` | 200/201 | 400 |
| DELETE | `/api/tax-rule-sources/:id` | `tax-rule-sources` | `deleteTaxRuleSource` | 204 | 404 |
| GET/POST | `/api/fee-receipts` | `fee-receipts` | `listFeeReceipts` / `createFeeReceipt` | 200/201 | 400 |
| GET/PUT/DELETE | `/api/fee-receipts/:id` | `fee-receipts` | get/update/delete | 200/204 | 404 |
| POST | `/api/fee-receipts/:id/duplicate` | `fee-receipts` | `duplicateFeeReceipt` | 201 | 404 |
| GET/PUT | `/api/fee-expense-settings` | `fee-receipts` | list/upsert settings | 200 | 400 |
| GET | `/api/fee-expense-settings/:taxYear` | `fee-receipts` | get settings | 200 | 404 |
| GET/POST | `/api/mortgages` | `mortgages` | list/create loans | 200/201 | 400 |
| GET/PUT/DELETE | `/api/mortgages/:id` | `mortgages` | get/update/delete loan | 200/204 | 404 |
| GET/POST | `/api/mortgages/:id/annual-records` | `mortgages` | list/create annual record | 200/201 | 400/404 |
| PUT/DELETE | `/api/mortgage-annual-records/:id` | `mortgages` | update/delete annual record | 200/204 | 404 |
| POST | `/api/simulate` | `simulation` | `systemUseCases.simulate` | 200 | 400 |
| POST | `/api/compare-apv` | `simulation` | `systemUseCases.compareApv` | 200 | 400 |
| POST | `/api/scenarios` | `simulation` | `systemUseCases.scenarios` | 200 | 400 |
| POST | `/api/article-55-bis` | `simulation` | `systemUseCases.article55Bis` | 200 | 400 |
| POST | `/api/fee-receipt-calc` | `simulation` | `systemUseCases.feeReceiptCalculation` | 200 | 400 |
| POST | `/api/snapshots` | `support-catalogs` | `saveSnapshot` + simulation | 201 | 400 |
| GET | `/api/references` | `support-catalogs` | `listReferences` | 200 | — |
| GET | `/*` | static service | `serveStatic` | 200 | 404 |

`GET /api/bootstrap` is now coordinated by `systemUseCases.bootstrap`; it
is no longer an inline handler in the local host.
