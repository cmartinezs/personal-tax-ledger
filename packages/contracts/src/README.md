# Fuente de contracts

Define contextos, contratos de repositorio, métodos obligatorios y suites reutilizables de validación. Cambiar un contrato exige actualizar adaptadores, dobles y tests de integración.

Organización por vertical slices:

- `features/income`, `settings`, `fees`, `mortgages`, `tax`, `snapshots`, `years`, `references`, `logs`: contratos de repositorio por feature.
- `shared/workspace-context.mjs`: contexto compartido de workspace.
- `index.mjs` re-exporta todo el API público; `testing.mjs` expone las suites reutilizables.
