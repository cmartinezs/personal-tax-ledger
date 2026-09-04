# Gaps — empaquetado Electron

## Lockfile desktop pendiente de sincronización

- **Tipo**: prerrequisito
- **Descripción**: `package.json` fija `electron` 44.2.0 y `@electron/packager` 20.3.0, pero `package-lock.json` todavía debe regenerarse/sincronizarse desde el workspace antes de volver a usar `npm ci`.
- **Impacto**: el packaging ya funciona, pero la instalación reproducible aún no está cerrada hasta persistir el lockfile actualizado.
- **Acción requerida**: validar el diff local de `package-lock.json`, persistirlo junto con la configuración npm requerida por npm 12 y volver a confirmar `npm ci`.
- **Prioridad**: alta

## Portable Windows x64 — CERRADO

- **Tipo**: gate completado
- **Estado**: PASS manual en Windows nativo, 2026-09-04.
- **Evidencia**: el artefacto generado desde WSL con staging materializado abrió correctamente en Windows; permitió ingresar/modificar datos, cerrar la aplicación y volver a abrirla conservando los datos en SQLite. `resources/app` quedó sin symlinks de workspace ni contenido de desarrollo (`.github`, docs, tests, scripts).
- **Resultado**: quedan validados arranque nativo autocontenido, resolución de módulos internos, cierre/reapertura y persistencia básica.
- **Pendiente menor**: comprobación explícita del comportamiento single-instance antes del instalador.

## Optimización ASAR/pruning pendiente

- **Tipo**: siguiente gate
- **Descripción**: el staging limpio ya reduce la superficie empaquetada, pero la etapa diagnóstica mantiene `asar: false` y `prune: false` para separar problemas de resolución de módulos de problemas de optimización.
- **Impacto**: el artefacto funciona y es autocontenido, pero todavía es más grande y más transparente de lo necesario para distribución.
- **Acción requerida**: habilitar ASAR y pruning de forma incremental sobre el staging ya validado y repetir arranque/persistencia/lifecycle en Windows.
- **Prioridad**: alta

## Instalador y firma pendientes

- **Tipo**: prerrequisito para UAT no técnico
- **Descripción**: Electron Forge/makers quedan deliberadamente fuera del gate portable. Todavía no se define maker/instalador ni firma de código.
- **Impacto**: aún no existe `PersonalTaxLedger-Setup.exe` ni una experiencia de instalación apropiada para UAT de usuario no técnico.
- **Acción requerida**: después del gate de optimización, seleccionar el tooling de instalador Windows, definir política de actualización y evaluar certificado de firma de código.
- **Prioridad**: media
