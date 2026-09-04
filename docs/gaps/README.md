# Gaps del proyecto

Cada vez que el agente encuentre algo que no puede hacer — por
desconocimiento funcional, desconocimiento técnico o falta de un
prerrequisito — debe dejarlo documentado en un archivo dentro de este
directorio, al final de la acción principal.

## Convención

- Un archivo por tema (o por sesión de trabajo si los gaps son varios).
- Nombre: `YYYY-MM-DD-tema-identificable.md` (p. ej.
  `2026-08-05-factura-honorarios-legal.md`).
- Usar español (idioma del proyecto).
- Cada gap debe indicar:
  - **Tipo**: `funcional` (no sé cómo debe comportarse el negocio),
    `técnico` (no sé cómo implementarlo) o `prerrequisito` (falta algo
    antes de poder avanzar).
  - **Descripción**: qué no se pudo hacer y por qué.
  - **Impacto**: qué entrega incompleta/posiblemente incorrecta genera.
  - **Acción requerida**: qué se necesita para desbloquearlo (validar con
    una fuente oficial, instalar dependencia, decisión de producto, etc.).
  - **Prioridad**: `alta` / `media` / `baja`.

## Índice

- [2026-08-05-implementacion-inicial.md](2026-08-05-implementacion-inicial.md)
  — gaps detectados durante la implementación de boletas de honorarios,
  art. 55 bis y escenarios (sesión inicial).
- [2026-08-05-apv-consistency-bugfix.md](2026-08-05-apv-consistency-bugfix.md)
  — gaps detectados al corregir la inconsistencia del APV por planilla entre
  el resumen y la simulación anual.
- [2026-08-05-dividend-widget-benefit.md](2026-08-05-dividend-widget-benefit.md)
  — gaps detectados al corregir que los intereses del widget de dividendos no
  llegaran al resumen del hipotecario ni al general (registro anual no editable
  desde la UI).
- [2026-08-05-mortgages-ui-refactor.md](2026-08-05-mortgages-ui-refactor.md)
  — gaps detectados en el refactor UI del módulo hipotecario (ahorro tributario
  del art. 55 bis siempre en $0 en la métrica del módulo).
- [2026-08-05-agrupacion-por-anio.md](2026-08-05-agrupacion-por-anio.md)
  — gaps detectados al agrupar la información por año comercial (créditos
  plurianuales, snapshots sin año, migración de ingresos, selector de años).
- [2026-08-05-bitacora-ejecuciones.md](2026-08-05-bitacora-ejecuciones.md)
  — gaps de los controles de carga y la bitácora (simulación automática sin
  registrar, sin limpieza/exportación, bitácora sin año comercial).
- [2026-08-06-tsc-web.md](2026-08-06-tsc-web.md)
  — gap histórico de configuración y tipado de `web/`, resuelto durante A.12.
- [2026-08-06-explicabilidad-modulos.md](2026-08-06-explicabilidad-modulos.md)
  — trazabilidad anual integrada; falta devolver explicaciones independientes
  desde los módulos especializados y sus previsualizaciones.
- [2026-08-06-paquete-a-verificacion.md](2026-08-06-paquete-a-verificacion.md)
  — verificación y re-implementación del Paquete A: A09/A10/A11/A13 existían
  como código no conectado a la aplicación real; corregidos y documentado el
  patrón de migración de agregados pendiente de A06.
- [2026-09-04-electron-packaging.md](2026-09-04-electron-packaging.md)
  — prerequisitos abiertos para lockfile/empaquetado reproducible y validación
  nativa Windows antes del UAT de usuario final.
