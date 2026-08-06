# Gaps detectados en el refactor UI del módulo de créditos hipotecarios

Fecha: 2026-08-05. Refactor aplicado: el módulo de hipotecarios ahora separa la
información en sub-tabs (Beneficio art. 55 bis / Créditos registrados / Registros
anuales) y cada métrica/card indica cómo se calcula el valor, de forma homóloga
al resumen general.

## Gap 1: la métrica «Ahorro tributario estimado» siempre muestra $0 en el módulo

- **Tipo**: funcional
- **Descripción**: `simulationMortgageTaxSaving()` en
  `web/src/mortgages-module.tsx` es un stub que devuelve 0. El ahorro real
  (diferencia del impuesto anual con y sin la rebaja) solo se computa dentro de
  `simulatePortfolio` en el resumen general (`totals.mortgageTaxSaving`), que el
  módulo no recibe como prop. La card «Resumen del beneficio art. 55 bis» muestra
  entonces un ahorro de $0 que no corresponde al cálculo real.
- **Impacto**: el usuario puede creer que la rebaja no genera ahorro tributario;
  la métrica es informativa pero errónea si no se lee el resumen general.
- **Acción requerida**: pasar `mortgageTaxSaving` (o `simulation.totals`) desde
  `App.tsx` al módulo, o exponer un endpoint que calcule el ahorro solo con los
  créditos y la renta imponible (reutilizando `taxFromTaxableIncome`). El hint de
  la métrica ya aclara que se estima en la simulación del Resumen.
- **Prioridad**: media
