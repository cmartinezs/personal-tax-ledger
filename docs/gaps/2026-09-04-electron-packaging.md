# Gaps — empaquetado Electron

## Lockfile desktop pendiente de sincronización

- **Tipo**: prerrequisito
- **Descripción**: `package.json` ya fija `electron` 44.2.0 y `@electron-forge/cli` 7.11.2, pero `package-lock.json` todavía debe regenerarse/sincronizarse desde el workspace antes de volver a usar `npm ci`.
- **Impacto**: el packaging quedó configurado, pero la instalación reproducible aún no está cerrada hasta persistir el lockfile actualizado.
- **Acción requerida**: ejecutar `npm install` en la rama, validar el diff de `package-lock.json`, correr la batería y persistir el lockfile si todo permanece verde.
- **Prioridad**: alta

## Validación portable Windows pendiente

- **Tipo**: prerrequisito
- **Descripción**: Electron ya abre correctamente en el entorno WSL2/WSLg, pero todavía no existe evidencia de un paquete Windows x64 autocontenido ejecutándose en Windows sin Git, Node, npm ni WSL.
- **Impacto**: no se puede declarar `PTL Local Windows UAT Ready` hasta comprobar arranque, persistencia, cierre y reapertura del artefacto portable en Windows.
- **Acción requerida**: generar `npm run desktop:package:win`, copiar la salida de `out/` a Windows y ejecutar `PersonalTaxLedger.exe`; registrar lifecycle y persistencia antes de optimizar ASAR/pruning o crear el instalador.
- **Prioridad**: alta

## Instalador y firma pendientes

- **Tipo**: prerrequisito
- **Descripción**: la configuración inicial de Forge no define makers ni firma de código. El gate actual produce solamente el paquete portable de diagnóstico.
- **Impacto**: aún no existe `PersonalTaxLedger-Setup.exe` ni una experiencia de instalación apropiada para UAT de usuario no técnico.
- **Acción requerida**: después del gate portable, elegir/configurar maker Windows, definir política de actualización y evaluar certificado de firma de código.
- **Prioridad**: media
