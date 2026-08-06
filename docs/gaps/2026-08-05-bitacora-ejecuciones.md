# Gaps detectados al agregar controles de carga y bitácora

Sesión en la que se agregaron controles de carga de datos (modal con loader
para operaciones sincronas; toaster para asincronas) y una bitácora de
ejecuciones persistida en SQLite (`execution_logs`) con tabla paginable y
filtros en el módulo "Bitácora de ejecuciones".

## Gap 1: la simulación automática no se registra en la bitácora

- **Tipo**: `funcional`
- **Descripción**: el motor recalcula la simulación automáticamente (debounced
  200 ms) tras cada cambio de datos. Para no inundar la bitácora, solo se
  registran operaciones explícitas del usuario (guardar/eliminar ingresos,
  boletas, créditos, registrar anual, guardar configuración, comparar APV,
  copiar ingresos, cambiar año, carga inicial). No se definió una política
  para registrar simulaciones recurrentes.
- **Impacto**: la bitácora no deja huella de cada ejecución del motor; solo de
  las acciones del usuario.
- **Acción requerida**: decidir si se quiere registrar cada simulación (con
  throttling/agrupación) y si se debe guardar el payload/resultado.
- **Prioridad**: `baja`

## Gap 2: la bitácora no permite limpiar ni exportar

- **Tipo**: `prerrequisito`
- **Descripción**: `execution_logs` solo acumula registros; no hay endpoint
  para borrar por antigüedad ni exportar a CSV. No se definió política de
  retención.
- **Impacto**: la tabla crece sin límite y no se puede depurar ni compartir el
  historial.
- **Acción requerida**: definir retención (p. ej. borrar > 90 días) o acción de
  limpieza/exportación si se requiere.
- **Prioridad**: `baja`

## Gap 3: la bitácora no guarda el año comercial

- **Tipo**: `funcional`
- **Descripción**: los registros de `execution_logs` no incluyen `tax_year`,
  por lo que no se puede filtrar la bitácora por año comercial. Es coherente
  con su rol (eventos del sistema), pero limita la correlación con los datos
  del año activo.
- **Impacto**: no es posible responder "qué operaciones se hicieron sobre el
  año X".
- **Acción requerida**: si se necesita, agregar `tax_year` a la tabla y al
  registro desde el cliente.
- **Prioridad**: `baja`
