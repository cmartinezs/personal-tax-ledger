# Gaps — empaquetado Electron

## Lockfile desktop — CERRADO

- **Tipo**: prerrequisito completado
- **Estado**: PASS.
- **Evidencia**: `package-lock.json` quedó sincronizado, `npm ci` funciona sin `.npmrc` especial y `npm audit` quedó en cero vulnerabilidades tras remediar la resolución vulnerable de `nanoid`.

## Portable Windows x64 — CERRADO

- **Tipo**: gate completado
- **Estado**: PASS manual en Windows nativo, 2026-09-04.
- **Evidencia**: el artefacto generado desde WSL con staging materializado abrió correctamente en Windows; permitió ingresar/modificar datos, cerrar la aplicación y volver a abrirla conservando los datos en SQLite. El runtime quedó sin symlinks de workspace ni contenido de desarrollo (`.github`, docs, tests, scripts).
- **Resultado**: quedan validados arranque nativo autocontenido, resolución de módulos internos, cierre/reapertura y persistencia básica.
- **Pendiente menor**: comprobación explícita del comportamiento single-instance antes del instalador.

## Optimización ASAR y pruning — CERRADO CON DECISIÓN ARQUITECTÓNICA

- **Tipo**: gate completado
- **Estado ASAR**: PASS manual en Windows nativo.
- **Estado pruning genérico de Packager**: RECHAZADO por incompatibilidad con el staging materializado.
- **Estado pruning efectivo de PTL**: PASS mediante staging determinista.
- **Evidencia ASAR**: con `asar: true` y `prune: false`, la aplicación abrió, leyó la misma base `userData`, permitió modificar datos y conservó persistencia tras cierre y reapertura.
- **Evidencia pruning negativo**: con `asar: true` y `prune: true`, el artefacto fue generado pero Windows falló al arrancar con `ERR_MODULE_NOT_FOUND` para `@personal-tax-ledger/contracts`.
- **Causa**: `.desktop-runtime` materializa manualmente `@personal-tax-ledger/*` bajo `node_modules`; el `package.json` mínimo del staging no los declara como dependencias npm instalables. El pruning genérico los clasifica como extraneous y los elimina.
- **Decisión**: mantener `prune: false` en `@electron/packager`. El pruning real ocurre en `scripts/build-desktop-runtime.mjs`, que copia únicamente los archivos runtime requeridos y excluye tests, docs, scripts y contenido de desarrollo.
- **Resultado**: el artefacto final conserva ASAR y un runtime mínimo sin depender de pruning genérico incompatible.

## Instalador y firma pendientes

- **Tipo**: prerrequisito para UAT no técnico
- **Descripción**: todavía no existe `PersonalTaxLedger-Setup.exe` ni una experiencia de instalación apropiada para usuario no técnico.
- **Acción requerida**: seleccionar e implementar el tooling de instalador Windows sobre el artefacto ASAR + staging determinista ya validado, definir comportamiento de upgrade/uninstall y evaluar firma de código.
- **Prioridad**: alta
