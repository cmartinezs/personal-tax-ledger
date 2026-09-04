# Gaps — empaquetado Electron

## Dependencia y lockfile reproducibles

- **Tipo**: prerrequisito
- **Descripción**: el wrapper Electron inicial usa `npx --yes electron@44.2.0` para UAT técnico y todavía no incorpora Electron ni un empaquetador como dependencias bloqueadas en `package-lock.json`.
- **Impacto**: el flujo desktop sirve para validar integración y compatibilidad, pero todavía no es apto para distribución offline/autocontenida ni para un instalador de usuario final.
- **Acción requerida**: validar primero el mismo commit en WSL2 y Windows nativo; luego instalar de forma reproducible las dependencias desktop, actualizar `package-lock.json`, seleccionar/configurar el empaquetador Windows y generar el primer artefacto instalable.
- **Prioridad**: alta

## Validación Windows nativa pendiente

- **Tipo**: prerrequisito
- **Descripción**: la integración Electron se ha preparado preservando el runtime local, pero aún falta evidencia de ejecución en Node/Electron nativos de Windows sobre el equipo de desarrollo.
- **Impacto**: no se puede declarar `PTL Local Windows UAT Ready` hasta comprobar build, smoke local, lifecycle Electron, persistencia y reapertura en Windows.
- **Acción requerida**: ejecutar la batería de validación Windows sobre el commit actual y registrar cualquier diferencia respecto de WSL2 antes de avanzar al instalador.
- **Prioridad**: alta
