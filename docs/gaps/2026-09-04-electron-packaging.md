# Gaps — empaquetado Electron

## Lockfile desktop — REABIERTO POR INSTALADOR

- **Tipo**: prerrequisito.
- **Estado**: pendiente de resincronización/persistencia final por nueva dependencia.
- **Contexto**: el lockfile había quedado verde y reproducible; el gate de instalador incorporó `electron-winstaller` 5.4.4.
- **Evidencia actual**: `npm install` y `npm audit` ejecutaron correctamente, con cero vulnerabilidades.
- **Acción requerida**: revisar el diff local final de `package-lock.json`/configuración npm, validar `npm ci` desde estado limpio y persistir cualquier cambio requerido.
- **Prioridad**: alta.

## Portable Windows x64 — CERRADO

- **Tipo**: gate completado.
- **Estado**: PASS manual en Windows nativo, 2026-09-04.
- **Evidencia**: el artefacto generado desde WSL con staging materializado abrió correctamente en Windows; permitió ingresar/modificar datos, cerrar la aplicación y volver a abrirla conservando los datos en SQLite. El runtime quedó sin symlinks de workspace ni contenido de desarrollo (`.github`, docs, tests, scripts).
- **Resultado**: quedan validados arranque nativo autocontenido, resolución de módulos internos, cierre/reapertura y persistencia básica.

## Optimización ASAR y pruning — CERRADO CON DECISIÓN ARQUITECTÓNICA

- **Tipo**: gate completado.
- **Estado ASAR**: PASS manual en Windows nativo.
- **Estado pruning genérico de Packager**: RECHAZADO por incompatibilidad con el staging materializado.
- **Estado pruning efectivo de PTL**: PASS mediante staging determinista.
- **Evidencia ASAR**: con `asar: true` y `prune: false`, la aplicación abrió, leyó la misma base `userData`, permitió modificar datos y conservó persistencia tras cierre y reapertura.
- **Evidencia pruning negativo**: con `asar: true` y `prune: true`, el artefacto fue generado pero Windows falló al arrancar con `ERR_MODULE_NOT_FOUND` para `@personal-tax-ledger/contracts`.
- **Decisión**: mantener `prune: false` en `@electron/packager`. El pruning real ocurre en `scripts/build-desktop-runtime.mjs`.

## Instalador Windows — BUILD E INSTALACIÓN INICIAL PASS

- **Tipo**: gate de distribución en cierre.
- **Implementación**: `electron-winstaller` 5.4.4 sobre el paquete ASAR ya validado; no se reincorpora Electron Forge.
- **Comando**: `npm run desktop:installer:win`.
- **Salida validada**: `out/installer-win32-x64/PersonalTaxLedger-Setup.exe` más metadata Squirrel.
- **Build host**: WSL/Linux con Mono + Wine; la construcción cross-platform quedó validada.
- **7-Zip Squirrel**: PTL materializa explícitamente `vendor/7z.exe` y `vendor/7z.dll` desde la variante del host antes de invocar `createWindowsInstaller()`, eliminando la dependencia del lifecycle script no materializado observado en WSL.
- **Evidencia Windows**: el `PersonalTaxLedger-Setup.exe` fue copiado a Windows, ejecutado e instalado correctamente; la aplicación instalada abrió y funcionó correctamente en validación manual del operador.
- **Estado**: PASS para build del Setup.exe + instalación/arranque inicial.
- **Pendiente de lifecycle**: validar explícitamente shortcut, single-instance, reinstalación/upgrade, desinstalación y preservación de `userData` después de uninstall/reinstall.
- **Prioridad**: alta hasta cerrar lifecycle.

## Firma de código — PENDIENTE

- **Tipo**: distribución final.
- **Descripción**: el primer instalador funcional se valida sin firma para separar el comportamiento de instalación del proceso de confianza/certificado.
- **Acción requerida**: después del PASS completo del lifecycle del Setup.exe, evaluar certificado y firma del instalador Windows antes de distribución externa sostenida.
- **Prioridad**: media.
