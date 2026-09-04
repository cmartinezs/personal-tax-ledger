# Gaps — empaquetado Electron

## Lockfile desktop pendiente de sincronización

- **Tipo**: prerrequisito
- **Descripción**: `package.json` fija `electron` 44.2.0, `@electron-forge/cli` 7.11.2 y `@electron/packager` 20.3.0, pero `package-lock.json` todavía debe regenerarse/sincronizarse desde el workspace antes de volver a usar `npm ci`.
- **Impacto**: el packaging quedó configurado, pero la instalación reproducible aún no está cerrada hasta persistir el lockfile actualizado.
- **Acción requerida**: ejecutar `npm install` en la rama, validar el diff de `package-lock.json`, correr la batería y persistir el lockfile si todo permanece verde.
- **Prioridad**: alta

## Validación portable Windows pendiente sobre staging materializado

- **Tipo**: prerrequisito
- **Descripción**: el primer paquete Windows x64 llegó a ejecutar Electron nativo, pero falló al resolver `@personal-tax-ledger/contracts` porque el empaquetado directo del monorepo dependía de enlaces de npm workspaces generados en Linux/WSL. La estrategia se corrigió introduciendo `.desktop-runtime`, un staging mínimo que materializa físicamente los paquetes internos requeridos antes de invocar `@electron/packager`.
- **Impacto**: el fallo quedó aislado en la materialización del runtime desktop; no se modificó el core tributario ni la composición hexagonal funcional.
- **Acción requerida**: regenerar `npm run desktop:package:win`, comprobar que `resources/app` ya no contiene el repositorio completo ni symlinks de workspace, copiar la nueva salida a Windows y validar arranque, persistencia, cierre, reapertura y single-instance.
- **Prioridad**: alta

## Optimización ASAR/pruning pendiente

- **Tipo**: mejora posterior al gate portable
- **Descripción**: el staging limpio ya reduce la superficie empaquetada, pero la etapa diagnóstica mantiene `asar: false` y `prune: false` para separar problemas de resolución de módulos de problemas de optimización.
- **Impacto**: el artefacto seguirá siendo mayor que la distribución final, aunque ya no debería exponer `.github`, documentación, tests ni scripts de desarrollo dentro del runtime.
- **Acción requerida**: sólo después de validar el portable Windows, habilitar ASAR y pruning de forma incremental y repetir las pruebas de persistencia/lifecycle.
- **Prioridad**: media

## Instalador y firma pendientes

- **Tipo**: prerrequisito
- **Descripción**: todavía no se define maker/instalador ni firma de código. El gate actual produce solamente el paquete portable de diagnóstico.
- **Impacto**: aún no existe `PersonalTaxLedger-Setup.exe` ni una experiencia de instalación apropiada para UAT de usuario no técnico.
- **Acción requerida**: después del gate portable, elegir/configurar maker Windows, definir política de actualización y evaluar certificado de firma de código.
- **Prioridad**: media
