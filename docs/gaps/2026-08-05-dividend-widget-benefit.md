# Gaps detectados al corregir el beneficio del art. 55 bis con el widget de dividendos

Fecha: 2026-08-05. Corrección aplicada: el motor del art. 55 bis ahora cae a los
campos del crédito (`annualInterestPaid`, etc.) cuando no existe registro anual,
y el widget de dividendos mensuales crea/actualiza el registro anual al guardar
el crédito. Tests 13 y 14 agregados en `server/test/mortgage-calculator.test.mjs`.

## Gap 1: la UI de registros anuales no puede editar un año ya existente

- **Tipo**: técnico
- **Descripción**: `saveAnnualRecord` en `web/src/mortgages-module.tsx` solo
  llama a `createAnnualRecord`. Si ya existe un registro para
  `(mortgage_loan_id, tax_year)` (constraint UNIQUE), la creación lanza un error
  400 en lugar de permitir editar ese año. La sección de registros anuales
  tampoco ofrece acciones de edición/borrado por fila (aunque la API
  `updateAnnualRecord`/`deleteAnnualRecord` sí existe).
- **Impacto**: un usuario que ya registró un año y quiere corregirlo (p. ej.
  después de usar el widget de dividendos sobre un préstamo con registro previo)
  no puede hacerlo desde la UI; el widget sí lo resuelve al guardar, pero la
  edición manual del registro queda bloqueada.
- **Acción requerida**: convertir la creación en upsert (buscar por
  `(loanId, taxYear)` y llamar `updateAnnualRecord` si existe) y/o agregar
  edición/borrado por fila en la sección de registros anuales.
- **Prioridad**: media
