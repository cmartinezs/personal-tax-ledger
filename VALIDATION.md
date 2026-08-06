# Validación realizada

## Completado

- Verificación sintáctica de todos los módulos Node con `node --check`.
- 29 pruebas unitarias y de integración del motor tributario con `node:test`:

```text
ℹ tests 29
ℹ pass 29
ℹ fail 0
```

- Pruebas cubren: conversión bruto/líquido, retenciones, PPM, gastos presuntos y efectivos, anulación, reconocimiento por fecha y por pago, consolidación de varias boletas; artículo 55 bis por tramos (90/150 UTA exactos), topes 8 UTA, dos crédito conglomerados, exclusiones, copropiedad sin beneficiario, capital/seguros excluidos, integración con APV B sin doble rebaja; integración completa con 2 empleadores + 3 boletas + PPM + 1 crédito + APV A/B y comparación de escenarios.
- Smoke test real de API + SQLite: creación de boletas, créditos hipotecarios, registros anuales, simulación consolidada con módulos inyectados, validación de errores estructurados `ApiError` con `fieldErrors`.
- Build de Vite OK: 21 módulos transformados, 73.77 kB gzip JS, 2.54 kB gzip CSS.
- Migraciones SQLite idempotentes aplicadas sobre la base existente (`tax_parameters`, `tax_rule_sources`, `fee_receipts`, `fee_expense_settings`, `mortgage_loans`, `mortgage_annual_records`).
- `tsc -b` sigue reportando errores preexistentes en `App.tsx` (de tipo `string | number` sobre `settings.year`) y `tsconfig.node.json` (opción `allowImportingTsExtensions`). Vite build los ignora por diseño. No se introdujeron nuevos errores TS en el código de los módulos nuevos.

## Cómo reproducir

```bash
npm install
npm test
npm run build
npm start
```

## No ejecutado en este entorno

- No se ejecutó linter externo (ESLint no está configurado en el proyecto).
- No se verificó la cobertura de código (no hay configurado un colector de cobertura).
