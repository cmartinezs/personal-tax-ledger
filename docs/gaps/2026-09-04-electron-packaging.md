# Gaps — empaquetado Electron

## Lockfile desktop — REABIERTO POR INSTALADOR

- **Tipo**: prerrequisito.
- **Estado**: pendiente de resincronización por nueva dependencia.
- **Contexto**: el lockfile había quedado verde y reproducible; el gate de instalador incorpora ahora `electron-winstaller` 5.4.4.
- **Acción requerida**: ejecutar `npm install`, revisar el diff de `package-lock.json`, correr `npm audit` + batería desktop y persistir el lockfile actualizado.
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

## Instalador Windows — EN VALIDACIÓN

- **Tipo**: gate activo para UAT no técnico.
- **Implementación**: `electron-winstaller` 5.4.4 sobre el paquete ASAR ya validado; no se reincorpora Electron Forge.
- **Comando**: `npm run desktop:installer:win`.
- **Salida esperada**: `out/installer-win32-x64/PersonalTaxLedger-Setup.exe` más metadata Squirrel.
- **Decisiones iniciales**: EXE solamente (`noMsi: true`), sin delta packages (`noDelta: true`) y sin auto-update todavía.
- **Lifecycle**: el proceso desktop maneja eventos Squirrel para crear/eliminar shortcuts en install/update/uninstall.
- **Datos**: SQLite permanece bajo `userData`, fuera del directorio instalado; upgrade/reinstall no debe reemplazar datos.
- **Build host**: desde WSL/Linux se requieren Mono y Wine; `create-windows-installer.mjs` valida explícitamente esas dependencias antes de generar Squirrel.Windows.
- **Validación requerida**: generar Setup.exe, instalar en Windows, abrir desde shortcut, comprobar datos existentes, modificar/guardar, cerrar/reabrir, reinstalar la misma versión, desinstalar y verificar política de preservación de `userData`.
- **Prioridad**: alta.

## Firma de código — PENDIENTE

- **Tipo**: distribución final.
- **Descripción**: el primer instalador funcional se valida sin firma para separar el comportamiento de instalación del proceso de confianza/certificado.
- **Acción requerida**: después del PASS del Setup.exe, evaluar certificado y firma del instalador Windows antes de distribución externa sostenida.
- **Prioridad**: media.
