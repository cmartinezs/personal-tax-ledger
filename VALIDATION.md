# Validación realizada

Estado consolidado al 2026-09-04.

## Arquitectura y runtime local

La validación más reciente del baseline hexagonal incluyó:

```text
npm audit
npm test
npm run test:workspaces
npm run build
npm run architecture:check
npm run desktop:check
npm run desktop:package:win
```

Resultado observado antes del cierre desktop:

```text
npm audit             0 vulnerabilities
root tests            107 PASS / 0 FAIL
workspace tests       PASS
Vite build            PASS
architecture:check    PASS
desktop:check         PASS
desktop:package:win   PASS
```

`architecture:check` verificó límites de paquetes internos, ausencia de ciclos, ausencia de roots legacy y separación entre application y sqlite-adapter.

## Distribución desktop Windows

### Portable

- `PersonalTaxLedger.exe` ejecutó en Windows nativo sin Git, Node.js, npm ni WSL.
- Los paquetes `@personal-tax-ledger/*` materializados resolvieron correctamente.
- La UI cargó y permitió crear/modificar datos.
- Cierre/reapertura preservó la SQLite.
- ASAR (`resources/app.asar`) fue validado.
- Una build ASAR leyó datos creados por la build portable previa.

### Pruning

`prune: true` de `@electron/packager` fue probado y rechazado: eliminó paquetes internos materializados y produjo `ERR_MODULE_NOT_FOUND`.

Configuración final:

```text
asar: true
prune: false
pruning efectivo: scripts/build-desktop-runtime.mjs
```

### Instalador

El instalador se genera con:

```bash
npm run desktop:installer:win
```

Artefacto validado:

```text
out/installer-win32-x64/PersonalTaxLedger-Setup.exe
```

El build Squirrel desde WSL quedó operativo con Mono + Wine y materialización determinista de los aliases `7z.exe`/`7z.dll` requeridos por `electron-winstaller`.

### Lifecycle Windows

Validación manual PASS para:

- ejecución de Setup.exe;
- aplicación instalada funcional;
- desinstalación;
- nueva instalación;
- instalación sobre instalación existente;
- continuidad de datos durante el lifecycle observado.

La base desktop permanece fuera de los binarios instalados bajo:

```text
app.getPath('userData')/data/personal-tax-ledger.sqlite
```

## Documentación de evidencia

- [`docs/desktop/final-configuration.md`](docs/desktop/final-configuration.md)
- [`docs/desktop/lessons-learned.md`](docs/desktop/lessons-learned.md)
- [`docs/desktop/uat-evidence-2026-09-04.md`](docs/desktop/uat-evidence-2026-09-04.md)

## Gates posteriores

No están incluidos en el PASS funcional desktop:

- firma de código;
- política formal de update/autoupdate;
- backup/export/restore y migraciones de esquema;
- UAT de usuario no técnico;
- cierre final de reproducibilidad del lockfile después de incorporar `electron-winstaller`.