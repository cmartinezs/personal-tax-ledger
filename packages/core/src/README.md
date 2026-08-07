# Fuente de core

Implementación de cálculos puros, parámetros por año, defaults, utilidades y explicaciones. Los módulos deben ser deterministas: reciben datos y devuelven resultados sin leer filesystem, entorno, HTTP o SQLite.

Organización por vertical slices:

- `features/portfolio`, `income`, `fees`, `mortgages`, `apv`, `scenarios`, `taxation`: cálculos puros por feature.
- `shared/`: defaults, aritmética monetaria y trazabilidad de explicaciones.
- Barrels raíz (`calculator.mjs`, `fee-calculator.mjs`, etc.): preservan los subpath exports públicos de `package.json`.
