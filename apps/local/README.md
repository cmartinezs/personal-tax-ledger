# Aplicación local

`@personal-tax-ledger/local-app` es el composition root de la aplicación local. Ensambla casos de uso, repositorios SQLite y host HTTP; Windows, Linux y macOS ejecutan este mismo código. Su API pública está exportada desde `src/index.mjs` y su entrypoint ejecutable es `src/main.mjs`.

## Ejecución

```bash
npm start
npm run smoke:local
```

Variables útiles: `PORT` cambia el puerto HTTP y `DB_PATH` cambia la ruta SQLite.

## Flujo de arranque

1. `main.mjs` registra señales y crea la aplicación.
2. `create-local-app.mjs` crea composición, router y servidor.
3. `composition/create-local-composition.mjs` crea una conexión SQLite compartida.
4. `http/router.mjs` delega cada endpoint a los routers reutilizables de `@personal-tax-ledger/http-api`.
5. `stop()` cierra HTTP y SQLite de forma idempotente.

## Estructura

- `src/main.mjs`: entrypoint, señales y shutdown.
- `src/create-local-app.mjs`: factory del servidor y lifecycle.
- `src/composition/`: composición de repositorios, casos de uso y routers.
- `src/http/`: host HTTP, routing, body JSON, errores y estáticos.
- `src/platform/`: diferencias de procesos, rutas y file URLs entre sistemas operativos.

Para Windows consulta [`docs/windows-local.md`](../../docs/windows-local.md). Para límites de arquitectura consulta [`docs/architecture/current-state.md`](../../docs/architecture/current-state.md).
