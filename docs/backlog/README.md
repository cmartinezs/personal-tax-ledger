# Backlog de la iniciativa — Personal Tax Ledger

Este directorio contiene el backlog técnico y de producto de Personal Tax Ledger cuando el trabajo requiere más detalle que un gap puntual. Su objetivo es mantener una secuencia explícita de slices, gates, criterios de aceptación, evidencia esperada y dependencias.

## Reglas

- El backlog describe trabajo futuro o en curso; no debe presentarse como capacidad ya validada.
- Cada ítem debe indicar propósito, alcance, precondiciones, procedimiento, criterios de aceptación, evidencia y condición de cierre.
- Los cambios funcionales o técnicos deben enlazar con la documentación canónica correspondiente cuando se implementen.
- Los resultados observados manualmente deben persistirse en `docs/desktop/` o `VALIDATION.md` cuando correspondan.
- Los hallazgos UX se registran cuando aparecen; si no bloquean el gate actual, se derivan a backlog de product polish para no perder foco ni evidencia.
- La web pública puede resumir el estado de alto nivel, pero no debe exponer información privada u operacional innecesaria.

## Backlog activo

- [`desktop-lifecycle-and-distribution.md`](desktop-lifecycle-and-distribution.md): cierre progresivo del lifecycle desktop Windows y preparación de distribución posterior.
- [`ux-and-product-polish.md`](ux-and-product-polish.md): hallazgos de usabilidad, overflow, layout, naming y consistencia visual que deben resolverse antes del UAT no técnico según severidad.
