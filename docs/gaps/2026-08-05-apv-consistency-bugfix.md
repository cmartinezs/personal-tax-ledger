# Gaps — Bugfix de consistencia APV por planilla (resumen vs simulación)

Fecha: 2026-08-05
Sesión: corrección del bug donde el resumen general y la simulación anual
mostraban saldos distintos con APV descontado por planilla en uno o varios
sueldos.

---

## 1. Sin framework de tests de frontend (prerrequisito — prioridad media)

**Descripción**: El caso de prueba "edición reactiva" (cambiar el monto de
APV de un sueldo y ver el resumen actualizarse sin recargar la página) solo
pudo verificarse a nivel del motor (re-simulación determinista) y revisando
el cableado de `web/src/App.tsx` (`refreshSimulation` depende de `sources`
y `saveSource` recarga tras guardar). No existe Vitest ni Testing Library en
`web/package.json`, por lo que no se pudo escribir una prueba de componente
React automatizada.

**Impacto**: Un cambio futuro en el cableado de estado de React podría
romper la actualización reactiva del resumen sin que la suite lo detecte.

**Acción requerida**: Agregar un framework de tests del frontend
(Vitest + @testing-library/react) y un caso mínimo que renderice el
dashboard, modifique el APV de un ingreso y verifique que el saldo cambia.

---

## 2. Escenarios de la "Simulación anual" omiten el APV configurado en las fuentes (funcional — prioridad media)

**Descripción**: `buildScenarios` en `server/lib/calculator.mjs` resetea a
`apvRegime: 'NONE'` el APV de todas las fuentes de ingreso para aislar el
efecto del APV comparado. Eso significa que un usuario con APV por planilla
configurado en un sueldo verá en la pestaña "Simulación anual" resultados
(por ejemplo el escenario `base`) que no incluyen ese APV, mientras que el
resumen del dashboard sí lo incluye. Es un comportamiento de diseño
"escenarios hipotéticos", pero no está documentado para el usuario y puede
leerse como otra inconsistencia del mismo bug.

**Impacto**: El saldo del escenario `base` no coincide con el saldo del
resumen cuando hay APV en las fuentes; riesgo de confusión.

**Acción requerida**: Decisión de producto: (a) preservar el APV de las
fuentes en los escenarios, o (b) mostrar una nota en la UI indicando que los
escenarios ignoran el APV configurado en los sueldos y solo comparan el APV
directo del escenario.

---

## 3. Línea "antes de APV por planilla" imprecisa cuando el APV mensual supera el tope mensual (funcional — prioridad baja)

**Descripción**: La reconciliación muestra
`Rentas de empleadores (antes de APV por planilla) = salaryTaxable + payrollApvContribution`.
Si el aporte mensual supera el tope mensual configurado (`apvBMonthlyCapUf`),
la base mensual se reduce solo por el monto topeado mientras que
`payrollApvContribution` acumula el aporte sin tope mensual, por lo que la
línea "antes de APV" puede sobreestimar ligeramente la renta. Es un caso
extremo (tope mensual ≈ 50 UF) que no afecta el saldo final ni la fuente
única de verdad.

**Impacto**: Solo imprecisión visual en un caso extremo; los totales finales
del resumen provienen del motor y son correctos.

**Acción requerida**: Si se quiere exactitud visual total, definir si
`payrollApvContribution` debe reflejar el aporte efectivamente deducido en
la base mensual (topeado) o el aporte bruto por planilla.

---

## 4. Errores preexistentes de `tsc -b` (técnico — prioridad media)

**Descripción**: Se confirmó que `npx tsc -b` sigue reportando solo los
errores preexistentes ya documentados en
[2026-08-05-implementacion-inicial.md](2026-08-05-implementacion-inicial.md)
(tipado de `Settings` en App.tsx, `import './styles.css'` en main.tsx y
`tsconfig.node.json` con `allowImportingTsExtensions`). No se introdujeron
errores de tipos nuevos con el bugfix.

**Impacto**: El chequeo estático de tipos sigue fallando aunque el build de
Vite y los tests pasen.

**Acción requerida**: Ticket dedicado para limpiar esos errores (ya
registrado como gap #5 de la sesión inicial).
