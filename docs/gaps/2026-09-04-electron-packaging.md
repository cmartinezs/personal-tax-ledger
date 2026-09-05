# Gaps — empaquetado Electron

## Lockfile desktop — REABIERTO POR INSTALADOR

- **Tipo**: prerrequisito.
- **Estado**: pendiente de resincronización/persistencia final por nueva dependencia.
- **Contexto**: el gate de instalador incorporó `electron-winstaller` 5.4.4.
- **Evidencia actual**: `npm install` y `npm audit` ejecutaron correctamente, con cero vulnerabilidades.
- **Acción requerida**: revisar el diff local final de `package-lock.json`/configuración npm, validar `npm ci` desde estado limpio y persistir cualquier cambio requerido.
- **Prioridad**: alta.

> Este pendiente no invalida la evidencia funcional del artefacto ya construido; afecta reproducibilidad canónica hasta que el lockfile final quede persistido.

## Portable Windows x64 — CERRADO

- **Tipo**: gate completado.
- **Estado**: PASS manual en Windows nativo, 2026-09-04.
- **Evidencia**: el artefacto generado desde WSL con staging materializado abrió correctamente en Windows; permitió ingresar/modificar datos, cerrar la aplicación y volver a abrirla conservando los datos en SQLite. El runtime quedó sin symlinks de workspace ni contenido de desarrollo (`.github`, docs, tests, scripts).

## Optimización ASAR y pruning — CERRADO CON DECISIÓN ARQUITECTÓNICA

- **Tipo**: gate completado.
- **Estado ASAR**: PASS manual en Windows nativo.
- **Estado pruning genérico de Packager**: RECHAZADO por incompatibilidad con el staging materializado.
- **Estado pruning efectivo de PTL**: PASS mediante staging determinista.
- **Decisión**: mantener `prune: false` en `@electron/packager`; el pruning real ocurre en `scripts/build-desktop-runtime.mjs`.

## Instalador Windows — CERRADO

- **Tipo**: gate completado.
- **Implementación**: `electron-winstaller` 5.4.4 sobre el paquete ASAR ya validado.
- **Comando**: `npm run desktop:installer:win`.
- **Salida validada**: `out/installer-win32-x64/PersonalTaxLedger-Setup.exe` más metadata Squirrel.
- **Build host**: WSL/Linux con Mono + Wine; la construcción cross-platform quedó validada.
- **7-Zip Squirrel**: PTL materializa explícitamente `vendor/7z.exe` y `vendor/7z.dll` desde la variante del host antes de invocar `createWindowsInstaller()`.
- **Evidencia Windows**: Setup.exe ejecutó e instaló correctamente; la aplicación instalada funcionó.
- **Lifecycle validado**: desinstalación, nueva instalación, instalación sobre instalación existente y continuidad de datos.
- **Resultado**: PASS funcional completo para instalación/reinstalación/uninstall-reinstall y preservación de `userData` observada.

La evidencia detallada queda en [`../desktop/uat-evidence-2026-09-04.md`](../desktop/uat-evidence-2026-09-04.md) y la configuración final en [`../desktop/final-configuration.md`](../desktop/final-configuration.md).

## Firma de código — PENDIENTE

- **Tipo**: distribución final.
- **Descripción**: el instalador funcional se validó sin firma para separar comportamiento de instalación de confianza/certificado.
- **Acción requerida**: evaluar certificado y firma antes de distribución externa sostenida.
- **Prioridad**: media.

## Update/autoupdate — PENDIENTE

- **Tipo**: lifecycle de versiones.
- **Estado**: no implementado en este cierre; `noDelta: true` permanece intencionalmente.
- **Acción requerida**: definir canal, política de versionado, rollback y compatibilidad de esquema antes de habilitar actualizaciones automáticas.
- **Prioridad**: media.

## Backup, restore y migraciones de datos — PENDIENTE

- **Tipo**: durabilidad de datos.
- **Estado**: persistencia básica y continuidad entre instalaciones validadas; todavía no existe contrato completo de backup/export/restore/migración de esquema.
- **Acción requerida**: tratarlo como slice separado antes de upgrades con cambios de esquema.
- **Prioridad**: media.

## UAT de usuario no técnico — PENDIENTE

- **Tipo**: experiencia de usuario.
- **Estado**: UAT técnico del instalador PASS.
- **Acción requerida**: ejecutar instalación/uso con usuario no técnico y registrar fricción real de onboarding.
- **Prioridad**: alta para siguiente fase.