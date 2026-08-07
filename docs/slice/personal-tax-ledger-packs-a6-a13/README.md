# Packs A.6-A.13

Serie de migración incremental del host local, persistencia SQLite, contratos API, frontend modular, shared UI, tests por workspace, TypeScript/CI y portabilidad Windows.

## Cómo leerla

- `README.md` de esta carpeta define el orden y las dependencias.
- `steps/` contiene un Markdown por paso.
- Ejecutar un paso solo después de validar el anterior con código y pruebas.
- Cada paso exige reportar `MD_EXECUTED`, `STATUS`, `DEPENDENCIES_VALIDATED`, `EVIDENCE` y `NEXT_MD`.

La serie no crea una aplicación cloud ni una aplicación Windows separada. `apps/local` es el host local en todos los sistemas operativos y los paquetes internos son las unidades reutilizables.
