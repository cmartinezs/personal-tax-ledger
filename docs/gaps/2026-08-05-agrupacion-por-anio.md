# Gaps detectados al agrupar la información por año comercial

Sesión en la que se agregó el selector de año global (header) y se convirtieron
los ingresos laborales (`income_sources`) en per-año con migración aditiva,
para que cada entrada del menú muestre la información del año activo y se
conserve el historial.

## Gap 1: créditos hipotecarios plurianuales atados a un solo año

- **Tipo**: `funcional`
- **Descripción**: `mortgage_loans` tiene una columna `tax_year` y el listado
  filtra por año activo. Un crédito hipotecario normalmente dura muchos años,
  pero hoy solo aparece en el año en que se creó; al navegar por otro año no se
  ve el crédito ni su historial de registros anuales completo (los registros
  anuales sí son por `(loan, año)`). No está decidido el modelo: crédito global
  con registros por año, o crédito per-año.
- **Impacto**: al cambiar el año, el módulo "Créditos hipotecarios" puede
  mostrar vacío aunque exista un crédito vigente de otro año; el historial del
  beneficio art. 55 bis de un mismo crédito no se visualiza continuamente.
- **Acción requerida**: decisión de producto + validar en SII cómo se declara
  el beneficio plurianual; definir si `mortgage_loans` deja de filtrarse por
  año (o se agrupa mostrando el crédito en todos los años donde tenga
  registros).
- **Prioridad**: `media`

## Gap 2: `simulation_snapshots` no tiene `tax_year`

- **Tipo**: `prerrequisito`
- **Descripción**: la tabla `simulation_snapshots` no guarda el año comercial;
  al agrupar todo por año, los snapshots quedan sin agrupar y no se listan en
  el selector de años ni en la navegación.
- **Impacto**: el historial de simulaciones guardadas no es navegable por año.
- **Acción requerida**: agregar `tax_year` a la tabla (migración aditiva) y
  exponer un endpoint si se quiere visualizar por año.
- **Prioridad**: `baja`

## Gap 3: migración de ingresos globales existentes a un año

- **Tipo**: `prerrequisito`
- **Descripción**: la migración agrega `income_sources.tax_year` con
  `DEFAULT 2026` (año activo en `defaultSettings`). Las fuentes globales
  preexistentes quedan asignadas a 2026 sin poder determinar a qué año
  pertenecían realmente.
- **Impacto**: instalaciones con fuentes de años anteriores ven sus ingresos
  solo en 2026; deben copiarlos manualmente a otros años (hay botón "Copiar
  desde" en la UI cuando el año está vacío).
- **Acción requerida**: validar con el usuario si las fuentes preexistentes
  deben migrarse a otro año; si hay datos previos reales, definir estrategia de
  migración antes de producir.
- **Prioridad**: `media`

## Gap 4: el selector de año no permite años futuros ni menores a 2024

- **Tipo**: `funcional`
- **Descripción**: por decisión del usuario, el selector global lista solo
  años en el rango `[2024 … año activo]` (sin años futuros, sin menores a
  2024). Esto impide iniciar un año nuevo más allá del activo o un año previo
  a 2024 desde la UI (p. ej. 2023 o 2030 sin datos previos).
- **Impacto**: no se pueden registrar escenarios de años fuera del rango sin
  editar `settings.year` por otro medio.
- **Acción requerida**: si más adelante se requiere soportar otros rangos,
  decidir si se agrega un input numérico editable además del select.
- **Prioridad**: `baja`
