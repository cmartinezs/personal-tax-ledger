# Fuente de application

Casos de uso que reciben contexto explícito y repositorios/servicios por inyección. No importar Node HTTP, SQLite, React ni APIs concretas.

Organización por vertical slices en `features/{income,settings,fees,mortgages,tax,snapshots,years,references,logs,system}`. `index.mjs` re-exporta el API público.
