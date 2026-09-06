# Backlog — UX y product polish

Estado general: `BACKLOG`

Este backlog reúne hallazgos visuales, de usabilidad, consistencia de producto y presentación que aparecen durante la validación funcional/lifecycle, pero que no invalidan por sí mismos los gates P0 de distribución desktop. Los hallazgos se registran en el momento en que aparecen para no perder evidencia, y se resuelven en una fase de product polish antes del UAT no técnico o antes de una distribución más amplia según su severidad.

## Regla de tratamiento

- Registrar inmediatamente cualquier hallazgo observado.
- No interrumpir un gate P0 de lifecycle por un hallazgo UX no bloqueante.
- Elevar a blocker si impide completar una tarea, provoca pérdida/corrupción de datos, oculta controles críticos o hace imposible operar a una resolución soportada.
- Resolver el conjunto de hallazgos UX de severidad alta/media antes de `PTL-UAT-001`.

---

## PTL-UX-001 — Overflow horizontal por contenido tabular largo

Estado: `BACKLOG`
Prioridad: `P1`
Severidad: `MEDIUM`
Origen: validación `PTL-DESKTOP-LC-002`
Fecha de detección: `2026-09-06`

### Hallazgo

En la pantalla de boletas de honorarios, valores largos en columnas como folio, cliente y descripción pueden ampliar la tabla y terminar expandiendo horizontalmente la superficie completa. En la evidencia observada aparece un scrollbar horizontal global en la parte inferior de la ventana.

### Impacto

- degrada la lectura de la pantalla;
- puede desplazar acciones de fila fuera del viewport;
- obliga a desplazamiento horizontal incluso cuando sólo una o pocas celdas contienen texto excepcionalmente largo;
- reduce la calidad de la experiencia desktop y puede ser especialmente confuso para usuario no técnico.

### Objetivo de solución

Mantener el layout principal estable aun cuando existan valores de texto extensos. El contenido debe degradar dentro de la tabla, no obligar a que la página completa crezca horizontalmente.

### Opciones de diseño a evaluar

- anchos máximos por columna;
- `text-overflow: ellipsis` para valores largos;
- `white-space` y wrapping selectivo según tipo de columna;
- tooltip/title o detalle expandible para consultar el valor completo;
- tabla con overflow horizontal contenido localmente sólo cuando sea inevitable;
- columna de acciones sticky o siempre accesible;
- límites/validaciones de longitud sólo si tienen sentido funcional, no como parche visual.

### Criterios de aceptación

- la aplicación no genera scroll horizontal global por un valor largo de una fila;
- las acciones principales siguen visibles o accesibles sin desplazar toda la página;
- folio/cliente/descripción extensos siguen siendo consultables completos;
- comportamiento verificado con datos cortos, normales y extremos;
- no se pierde legibilidad en la resolución mínima soportada por la ventana Electron.

### Gate recomendado

Probar al menos:

1. valor corto;
2. valor de aproximadamente 50 caracteres;
3. valor de 100+ caracteres;
4. varias columnas largas simultáneamente;
5. ventana en ancho mínimo soportado;
6. ventana maximizada.

---

## PTL-UX-002 — Consistencia de naming y branding visible

Estado: `BACKLOG`
Prioridad: `P1`
Severidad: `LOW-MEDIUM`
Origen: evidencia visual de `PTL-DESKTOP-LC-002`
Fecha de detección: `2026-09-06`

### Hallazgo

La evidencia visual muestra nombres distintos para el mismo producto según la superficie: el título nativo de la ventana usa `Simulador Tributario y APV Chile`, mientras la identidad dentro de la aplicación muestra `Tributación + APV`, y la iniciativa/repositorio/documentación se presenta como `Personal Tax Ledger`.

### Riesgo

La coexistencia de nombres puede ser válida si existe una arquitectura formal de marca/nombre funcional, pero actualmente puede producir ambigüedad sobre si se trata de la misma aplicación, un módulo o un nombre legado.

### Objetivo

Definir qué nombre es:

- nombre canónico del producto;
- nombre mostrado al usuario final;
- título de ventana;
- nombre del instalador/ejecutable;
- eventual subtítulo o descriptor funcional.

### Criterios de aceptación

- existe una decisión explícita de naming;
- título de ventana, producto instalado, branding interno y documentación no se contradicen;
- cualquier diferencia de nombre es intencional y documentada;
- no se preservan nombres legacy sólo por inercia técnica.

---

## Orden de resolución recomendado

1. Completar `PTL-DESKTOP-LC-003` y `PTL-DESKTOP-LC-004`.
2. Resolver `PTL-UX-001` antes del UAT no técnico.
3. Cerrar decisión de naming de `PTL-UX-002` antes del UAT no técnico.
4. Ejecutar una pasada de product polish general y regresión visual.
5. Iniciar `PTL-UAT-001` con la superficie ya estabilizada.
