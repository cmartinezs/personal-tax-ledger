# Simulador Tributario y APV Chile

MVP local para estimar remuneraciones, cotizaciones, IUSC/Global Complementario, diferencias por múltiples empleadores, boletas de honorarios, crédito hipotecario (artículo 55 bis LIR) y comparación APV Régimen A/B.

## Arquitectura de migración

La migración incremental mantiene `server/` y `web/` como fachadas compatibles y ya dispone de paquetes internos para cálculos puros, contratos, DTOs HTTP, adaptadores SQLite, casos de uso y UI reutilizable. El estado y la secuencia están documentados en `docs/architecture/`.

Comandos de verificación arquitectónica:

```bash
npm run architecture:check
npm run pack:smoke
```

Los paquetes se mantienen privados durante esta etapa. `npm run pack:smoke` solo genera tarballs en un directorio temporal, los instala en un consumidor temporal y no publica nada.

## Stack

- Node.js 24 LTS recomendado.
- React 19.2 + TypeScript 7.
- Vite 8.
- SQLite mediante `node:sqlite`, sin ORM ni dependencia nativa externa. En Node 24.15+ el módulo está clasificado como release candidate.
- API HTTP nativa de Node.

## Funcionalidades

- Guarda múltiples trabajos, honorarios, bonos y otros ingresos en SQLite.
- Acepta sueldos brutos o líquidos; cuando se ingresa líquido estima el bruto por búsqueda numérica.
- Calcula AFP obligatoria, comisión AFP, Fonasa/Isapre, seguro de cesantía e IUSC por empleador.
- Consolida todos los ingresos y estima el impuesto anual, retenciones y saldo por pagar/devolver.
- **Módulo de Boletas de Honorarios**:
  - Registro de boletas con bruto/líquido, retención por receptor, PPM pagado por emisor o sin retención.
  - Cálculo automático con tasa de retención 2026 del 15,25% versionada por año comercial.
  - Estados activa/anulada y pago pendiente/pagado, con criterio configurable de reconocimiento tributario (`ISSUE_DATE` o `PAID_ONLY`).
  - Gastos presuntos (30% con tope de 15 UTA) o gastos efectivos incorridos.
  - Resumen anual: bruto emitido, bruto pagado, retenciones, PPM, sin retención, líquido recibido, contadores activos/pendientes/anulados.
  - Tabla con filtros por año, cliente, estado, pago y tipo de retención; ordenación por fecha o monto.
  - Acciones: crear, editar, duplicar, anular/restaurar y eliminar con confirmación.
- **Módulo de Créditos Hipotecarios**:
  - Registro del crédito (institución, propiedad, destino, tipo de propiedad, % de propiedad, beneficiario designado, certificado).
  - Registros anuales separados por año: el interés histórico nunca se sobrescribe.
  - Cálculo del beneficio estimado del **artículo 55 bis LIR** con parámetros tributarios versionados.
  - Solo se consideran intereses elegibles; capital, seguros, gastos comunes y comisiones se reportan por separado pero **no** son deducibles.
  - Tope de 8 UTA sobre la suma de intereses de todos los créditos elegibles.
  - Porcentaje de rebaja por tramos de renta en UTA: 100% (< 90 UTA), fórmula decreciente `250 − 1,667 × UTA` (90–150 UTA) y 0% (> 150 UTA).
  - Advertencias explícitas para copropiedad sin beneficiario designado, refinanciamientos y créditos no elegibles.
  - Diferenciación visual entre **intereses pagados**, **rebaja de base imponible** y **ahorro tributario real**.
- **Simulación anual** integrada con el siguiente pipeline:
  1. Consolidar sueldos y otras rentas.
  2. Consolidar renta neta de honorarios (gastos presuntos o efectivos).
  3. Determinar renta bruta imponible.
  4. Calcular la rebaja estimada del artículo 55 bis (sin rebajar todavía).
  5. Aplicar APV Régimen B directo y demás rebajas admitidas.
  6. Calcular la base imponible final.
  7. Calcular Impuesto Global Complementario estimado.
  8. Restar IUSC retenido por empleadores.
  9. Restar retenciones de honorarios.
  10. Restar PPM pagados.
  11. Determinar saldo por pagar o devolver.
- **Escenarios comparativos**:
  - Sin hipotecario y sin APV; solo hipotecario; hipotecario + APV A; hipotecario + APV B.
  - Distintos aportes mensuales de APV (reglón B).
  - Boletas con retención por terceros vs PPM/sin retención.
  - Gastos presuntos vs gastos efectivos.
  - Cada escenario reporta base imponible, impuesto, retenciones, beneficio hipotecario, beneficio APV, saldo, diferencia vs base, liquidez comprometida y ahorro previsional acumulado.
- Mantiene parámetros tributarios editables y versionados por año comercial (`tax_parameters`).
- Trazabilidad de fuentes oficiales con la tabla `tax_rule_sources`.

## Ejecución

```bash
npm install
npm run dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:3001`

Producción local:

```bash
npm run build
npm start
```

La aplicación completa queda disponible en `http://localhost:3001`.

## Tests

```bash
npm test
```

Los tests cubren:

- Boletas: 1) bruta con retención 2026, 2) ingresada como líquido, 3) PPM pagado por emisor, 4) sin retención, 5) anulada excluida, 6) reconocimientos por ISSUE_DATE y PAID_ONLY, 7–8) gastos presuntos bajo y sobre el tope de 15 UTA, 9) gastos efectivos con tope al bruto, 10) consolidación de varias boletas.
- Hipotecario: 1) renta < 90 UTA, 2) renta = 90 UTA, 3) 90 < renta < 150 UTA, 4) renta = 150 UTA, 5) renta > 150 UTA, 6) intereses < 8 UTA, 7) intereses > 8 UTA, 8) dos créditos acumulados, 9) crédito no elegible, 10) copropiedad sin beneficiario designado, 11) exclusión de capital/seguros/otros cargos, 12) integración con APV B sin doble rebaja.
- Integración: 2 empleadores + varias boletas con retención parcial + PPM + 1 crédito hipotecario + APV A y B, comparación de escenarios.

Salida esperada: **29 tests pasando, 0 fallando.**

## Modelo de cálculo

### Sueldo mensual

1. Determina la base imponible previsional con tope de 90 UF.
2. Descuenta 10% AFP, comisión AFP, salud legal y AFC cuando corresponde.
3. Para APV B por planilla, rebaja el aporte antes de calcular IUSC.
4. Cada empleador calcula su retención de manera independiente.

### Boletas de honorarios

- Modo bruto: `retención = bruto × tasa`, `líquido = bruto − retención`.
- Modo líquido: `bruto = líquido / (1 − tasa)`, `retención = bruto − líquido`.
- PPM pagado por emisor: el `líquido` se entrega intacto al receptor y el PPM se paga aparte.
- NO_WITHHOLDING: `withholdingRate` efectivo es 0 y no hay retención.
- Redondeo monetario CLP con 2 decimales (`Math.round(value*100)/100`); no usa floats crudos en acumulación.
- Las boletas anuladas no se incorporan a los totales tributarios.
- El reconocimiento tributario respeta el criterio de la configuración: por fecha de emisión o solo boletas pagadas.

### Gastos de honorarios

- PRESUMED: `gasto = min(bruto × 30%, 15 × UTA)` con `UTA = UTM × 12`.
- ACTUAL: `gasto = min(ingresado, bruto)`; `ingresado >= 0`.
- El modo se persiste por año en `fee_expense_settings`.

### Crédito hipotecario (art. 55 bis LIR)

```text
monto_base_deducible = min(sumatoria_intereses_elegibles, 8 UTA)
```

Por tramos de renta imponible anual (UTA = UTM × 12):

| Renta (UTA)        | Porcentaje de rebaja                          |
|--------------------|------------------------------------------------|
| < 90               | 100%                                           |
| [90, 150]          | `250 − renta_UTA × 1,667`, clampeado a [0,100] |
| > 150              | 0%                                             |

```text
rebaja_base = monto_base_deducible × porcentaje / 100
ahorro_tributario = impuesto_sin_rebaja − impuesto_con_rebaja
```

- La base se rebaja `rebaja_base` de la base imponible del Global Complementario.
- El ahorro tributario real se calcula recalculando el impuesto con y sin rebaja.
- Solo los **intereses** cuentan; capital, seguros, gastos comunes y comisiones se reportan como informativos y nunca como rebaja.
- En copropiedad solicitamos el porcentaje y un flag de beneficiario designado, pero el motor no asume automáticamente que el usuario puede usar el 100%; se emite advertencia de validación documental.
- La información se mantiene separada del cálculo principal para futuras reglas más completas.

### Reliquidación anual

1. Suma las bases tributables anuales de empleadores, honorarios y otros ingresos.
2. Determina `renta_bruta_imponible`.
3. Calcula `rebaja_55bis` (sin tocar base todavía; solo se usa para la base final).
4. Aplica APV B directo respetando el tope anual de 600 UF.
5. Calcula `base_imponible = max(0, renta_bruta_imponible − rebaja_55bis − APV_B_aceptado)`.
6. Calcula impuesto Global Complementario.
7. Resta IUSC retenido por empleadores.
8. Resta retenciones de honorarios (por receptor) y PPM pagados por emisor.
9. Determina saldo por pagar o devolver.

## Fuentes normativas incluidas

- SII: tablas IUSC 2026.
- SII: Guía Práctica de Declaración de Renta 2026.
- SII: retención de boletas de honorarios 2026 (15,25%).
- SII: valores UF 2026.
- SII: interés hipotecario art. 55 bis / tope 8 UTA / tabla por nivel de renta.
- Superintendencia de Pensiones: topes imponibles y comisiones AFP.
- Fonasa: cotización legal de salud del 7%.
- Biblioteca del Congreso Nacional: Ley sobre Impuesto a la Renta, artículo 55 bis.

Las reglas individuales se registran en `tax_rule_sources` con ruta, fecha de consulta y notas.

## Limitaciones legales y tributarias relevantes

- **Es un estimador, no reproduce todas las líneas del Formulario 22.** El resultado debe contrastarse con los certificados del SII y la propuesta de declaración oficial.
- Para el año comercial 2026, el cálculo anual usa como proyección la UTM configurada multiplicada por 12. El impuesto definitivo dependerá de la UTM de diciembre de 2026.
- No modela todas las reglas previsionales de trabajadores independientes, cobertura parcial, SIS, SANNA, ATEP ni saldos insolutos.
- No contempla asignaciones no imponibles, créditos tributarios, dividendos, ganancias de capital, arriendos, donaciones u otras rebajas personales además del artículo 55 bis.
- En Régimen A no valida automáticamente el límite adicional ligado a las cotizaciones obligatorias del trabajador.
- No proyecta rentabilidad, comisión del producto APV, impuesto futuro de pensión ni impuesto por retiro anticipado.
- Los intereses del artículo 55 bis solo se consideran sobre la **base declarada por el banco** (certificado anual). El simulador no valida automáticamente destino DFL2; la elegibilidad se declara por crédito.
- En copropiedad el motor no aplica automáticamente el porcentaje de propiedad; el usuario debe certificar la designación como beneficiario.
- Las boletas reconocidas por fecha de emisión incluye pendientes de pago; el tratamiento definitivo debe contrastarse con los certificados del SII.
- Los gastos efectivos de honorarios requieren respaldo documental; no se valida la acreditación, solo se acota al ingreso bruto.

## Esquema de base de datos SQLite final

```text
settings(id=1)                # singleton JSON de parámetros del UI
income_sources                # fuentes de ingreso laborales (legacy)
official_references           # catálogo estático de fuentes oficiales
simulation_snapshots          # snapshots guardados por el usuario

tax_parameters                # parámetros tributarios versionados (tax_year, rule_key)
tax_rule_sources              # trazabilidad de reglas consultadas (id, rule_key, tax_year)

fee_receipts                  # boletas de honorarios (id TEXT PK, tax_year índice)
fee_expense_settings          # un registro por tax_year con el modo de gastos

mortgage_loans                # créditos hipotecarios (id TEXT PK, tax_year índice)
mortgage_annual_records       # registros anuales de intereses; FK on delete cascade
```

Índices: `tax_year`, `issue_date`, `client_name`, `status`, `payment_status`, `withholding_mode`, `mortgage_loan_id`, `institution_name`.

## API

```text
GET    /api/bootstrap
GET    /api/incomes
POST   /api/incomes
PUT    /api/incomes/:id
DELETE /api/incomes/:id

PUT    /api/settings
POST   /api/simulate
POST   /api/compare-apv
POST   /api/scenarios
POST   /api/article-55-bis
POST   /api/fee-receipt-calc

GET    /api/fee-receipts?taxYear=&clientName=&status=&paymentStatus=&withholdingMode=
POST   /api/fee-receipts
GET    /api/fee-receipts/:id
PUT    /api/fee-receipts/:id
DELETE /api/fee-receipts/:id
POST   /api/fee-receipts/:id/duplicate

GET    /api/fee-expense-settings
PUT    /api/fee-expense-settings
GET    /api/fee-expense-settings/:taxYear

GET    /api/mortgages?taxYear=&institutionName=&propertyAlias=
POST   /api/mortgages
GET    /api/mortgages/:id
PUT    /api/mortgages/:id
DELETE /api/mortgages/:id

GET    /api/mortgages/:id/annual-records?taxYear=
POST   /api/mortgages/:id/annual-records
PUT    /api/mortgage-annual-records/:id
DELETE /api/mortgage-annual-records/:id

GET    /api/tax-parameters?taxYear=
PUT    /api/tax-parameters            # body: { taxYear, values: Record<string, number> }

GET    /api/tax-rule-sources?ruleKey=&taxYear=
POST   /api/tax-rule-sources
DELETE /api/tax-rule-sources/:id
```

Errores estructurados:

```ts
interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}
```

## Parámetros tributarios versionados por año

Para 2026:

```text
fee_withholding_rate                          = 0.1525
fee_presumed_expense_rate                     = 0.30
fee_presumed_expense_max_uta                 = 15
mortgage_interest_max_uta                    = 8
mortgage_full_benefit_income_max_uta          = 90
mortgage_partial_benefit_income_max_uta       = 150
mortgage_partial_formula_constant            = 250
mortgage_partial_formula_factor              = 1.667
```

Estos parámetros se cargan desde `tax_parameters` al iniciar el server para 2026. Para añadir un año nuevo, copia las semillas de 2026 en `server/lib/tax-parameters.mjs` (`TAX_PARAMETER_SEEDS`) y reinicia; las migraciones son idempotentes y respetan la base existente.

## Evolución recomendada (siguiente iteración)

1. Validación/RUT chileno estricto en cliente y boleta.
2. Aplicar el porcentaje de copropiedad a los intereses elegibles cuando se confirme la designación.
3. Importación de certificados CSV del SII (remuneraciones, boletas, intereses hipotecarios).
4. Parámetros mensuales de UTM/UF por año y cálculo histórico exacto.
5. Autenticación local, cifrado de la base y respaldos automáticos.
6. Exportación PDF/Excel de escenarios.
7. Integración opcional con APIs oficiales cuando existan endpoints estables y autorizados.
8. Diferenciación más fina entre renta afecta/no afecta en honorarios (boletas exentas).
9. Validar el crédito original en refinanciamientos antes de aceptarlos como 55 bis.
10. Cálculo exacto del tramo parcial usando el ingreso efectivo del Formulario 22.
