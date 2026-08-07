# Scripts de mantenimiento

Todos los scripts deben ejecutarse con Node y APIs estándar, sin asumir Bash, `grep`, `sed`, `rm -rf` o `test -f`.

- `lint.mjs`: sintaxis JavaScript/ESM.
- `architecture-check.mjs`: grafo de paquetes y límites.
- `package-smoke.mjs`: empaquetado e import real desde tarballs.
- `smoke-local.mjs`: runtime HTTP con SQLite temporal.
- `dev.mjs`: frontend y local con spawning portable.

## Tabla rápida

| Script | Uso | Efectos |
|---|---|---|
| `lint.mjs` | `npm run lint` | Solo valida sintaxis. |
| `architecture-check.mjs` | `npm run architecture:check` | Inspecciona imports de paquetes/apps. |
| `package-smoke.mjs` | `npm run pack:smoke` | Crea tarballs e instala un consumidor temporal. |
| `smoke-local.mjs` | `npm run smoke:local` | Arranca local con SQLite temporal y borra el directorio temporal. |
| `shared-ui-consumer-smoke.mjs` | Smoke de shared-ui | Renderiza exports públicos desde el workspace. |
| `dev.mjs` | `npm run dev` | Ejecuta API y Vite con comandos portables. |

Antes de agregar un script, verifica que pueda ejecutarse en `windows-latest`.
