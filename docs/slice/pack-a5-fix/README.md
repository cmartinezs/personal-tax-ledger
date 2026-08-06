# Personal Tax Ledger — paquete de corrección A5 (pack-a5-fix)

Versión: 1.0
Fecha: 2026-08-06
Origen: hallazgos de `docs/gaps/migration-fails.md` (revisión externa del
Paquete A) que **siguen vigentes** después de la corrección aplicada en
`docs/gaps/2026-08-06-paquete-a-verificacion.md`.

## Qué es este paquete

Este NO es un rehacer del Paquete A. Es un conjunto de correcciones
puntuales y acotadas sobre A05–A13, necesarias para que el repositorio
quede en condiciones de iniciar el Paquete B (repositorio cloud) sin
arrastrar contratos síncronos, efectos secundarios ocultos, tests
ad-hoc o un CI que no verifica lo que dice verificar.

Antes de ejecutar cualquier prompt, confirma en
`docs/gaps/2026-08-06-paquete-a-verificacion.md` y en
`docs/architecture/migration-sequence.md` que A09, A10 (integración) y
A11 (uso del composition root) y A13 (CI corre `architecture:check`)
siguen resueltos; si alguien revirtió esos commits, detente y repara eso
primero, fuera de este paquete.

## Cómo usar este documento

Ejecuta los prompts en `prompts/` en orden y en sesiones separadas. Cada
prompt debe producir un PR pequeño. No entregues al agente todos los
prompts como una orden de implementación única.

Antes de cada prompt, pega el **Contrato general de ejecución** de esta
sección. Después agrega solo el prompt correspondiente.

No avances automáticamente a la siguiente iteración. Primero revisa y
fusiona el PR actual, y marca el criterio correspondiente en
`docs/acceptance-matrix.md`.

## Orden y dependencias

| # | Prompt | Corrige | Depende de |
|---|---|---|---|
| 01 | [async-repository-contract](prompts/01-a05-async-repository-contract.md) | A05 | — |
| 02 | [contract-test-suite](prompts/02-a06-contract-test-suite.md) | A06 | 01 |
| 03 | [integrate-income-module](prompts/03-a09-integrate-income-module.md) | A09 (cierre formal) | 01 |
| 04 | [finish-shared-ui](prompts/04-a10-finish-shared-ui.md) | A10 | 01, 03 |
| 05 | [fix-composition-root](prompts/05-a11-fix-composition-root.md) | A11 | 01 |
| 06 | [real-package-smoke](prompts/06-a12-real-package-smoke.md) | A12 | 04 |
| 07 | [complete-ci](prompts/07-a13-complete-ci.md) | A13 | 05, 06 |
| 08 | [cleanup-api-contracts](prompts/08-cleanup-api-contracts.md) | A04 | 01 |
| 09 | [final-validation](prompts/09-final-validation.md) | Cierre | 01–08 |
| 10 | [release-pack-a](prompts/10-release-pack-a.md) | Desbloqueo de B00 | 09 |

## Contrato general de ejecución

```text
Trabaja únicamente en el alcance de esta iteración.

Reglas obligatorias:

1. Antes de modificar, inspecciona el repositorio, su estado Git, tests
   y estructura actual de packages/core, contracts, api-contracts,
   application, sqlite-adapter, shared-ui y apps/local. Resume
   brevemente los hallazgos relevantes antes de tocar código.
2. Conserva el comportamiento observable de la aplicación y las URLs y
   respuestas HTTP existentes, salvo que esta iteración indique
   expresamente un cambio de tipo (p. ej. sync -> async).
3. No hagas refactorizaciones oportunistas ni cambios masivos de
   formato fuera del alcance del prompt.
4. No reemplaces node:sqlite, React, Vite ni agregues frameworks nuevos
   sin necesidad demostrable. Si necesitas una herramienta de build
   (p. ej. para compilar shared-ui), usa la más simple compatible con
   el stack ya declarado en package.json (tsc), no agregues bundlers.
5. Mantén los cálculos tributarios (`packages/core`) independientes de
   HTTP, React, SQLite, Supabase, Firebase y variables de entorno.
6. Todo cambio estructural debe estar cubierto por tests: unitarios,
   contractuales o de integración según corresponda. Los tests deben
   demostrar el comportamiento real, no solo grep de texto sobre un
   archivo fuente.
7. Los tests existentes deben seguir pasando. Ejecuta `npm test`,
   `npm run architecture:check` y, si tocaste `web/`,
   `npx --no-install vite build` desde `web/`.
8. No borres ni reescribas migraciones SQLite ya aplicadas.
9. No introduzcas secretos, tokens ni datos personales reales.
10. Si el alcance exige una decisión arquitectónica no definida en este
    prompt, detente y documenta alternativas en un archivo de
    `docs/gaps/`; no inventes una expansión importante.
11. Entrega un solo PR cohesivo y pequeño. Si el cambio resulta
    demasiado grande, implementa solo la primera porción segura y deja
    el resto como próximos pasos explícitos en el prompt siguiente.
12. Al finalizar, actualiza `docs/acceptance-matrix.md` marcando los
    criterios cumplidos por este prompt e informa: archivos relevantes,
    decisiones tomadas, pruebas ejecutadas, resultado, riesgos y
    siguiente iteración recomendada.
13. Si el cambio toca la API HTTP, verifica con curl contra el servidor
    real (`DB_PATH` temporal, `PORT` libre) además de los tests
    automatizados.

Definición de terminado para este paquete:

- El repositorio queda ejecutable y `npm test` pasa sin regresiones.
- El diff corresponde únicamente al objetivo del prompt.
- El criterio de aceptación del prompt está verificado, no asumido.
- `docs/acceptance-matrix.md` y, si corresponde,
  `docs/migration-checklist.md` quedan actualizados.
```

## Documentos de apoyo

- [`docs/migration-checklist.md`](docs/migration-checklist.md): checklist
  operativo por prompt, para marcar avance sesión a sesión.
- [`docs/acceptance-matrix.md`](docs/acceptance-matrix.md): matriz de
  criterios de aceptación por iteración (A05–A13), con estado actual.
- [`docs/review-checklist.md`](docs/review-checklist.md): checklist que
  debe pasar cualquier PR de este paquete antes de fusionarse.
