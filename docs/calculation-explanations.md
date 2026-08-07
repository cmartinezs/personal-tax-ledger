# Capa de explicabilidad

El motor `packages/core/src/calculator.mjs` entrega el resultado anual y `explanations` en la misma ejecución. Cada elemento usa los constructores de `packages/core/src/calculation-explanation.mjs` para conservar inputs, expresiones aplicadas, pasos, resultado, redondeo, supuestos y referencias de regla.

Para agregar una explicación:

1. Calcula el valor en el motor junto con el resultado que ya consume la aplicación.
2. Pasa esos valores al bloque `buildExplanations`; no reconstruyas la fórmula en React.
3. Usa `calculationInput`, `calculationStep` y `calculationResult` para que los valores mostrados sean los mismos valores calculados.
4. Añade una prueba que compare `explanation.result.value` con el resultado numérico y cubra topes, exclusiones o estados no aplicables.
5. Si la regla depende de parámetros versionados, incluye `taxYear`, `ruleVersion` y `sourceRefs`.

El componente `web/src/calculation-explanation-panel.tsx` solo presenta la trazabilidad recibida: panel colapsable, acordeones, modo técnico y exportación JSON.
