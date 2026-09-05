# Lecciones aprendidas — Electron y distribución Windows

Periodo de trabajo: 2026-09-04.

Este documento registra decisiones y fallos reproducidos para evitar repetir diagnósticos o reintroducir configuraciones descartadas.

## 1. Reconciliar semánticamente, no restaurar roots obsoletos

La incorporación de Electron debía envolver la arquitectura hexagonal vigente, no restaurar antiguos roots `server/` o `web/`.

Regla que queda:

> Electron depende de `apps/local`; `apps/local` no depende de Electron.

La lógica tributaria permanece en `core/application` y la persistencia en adapters.

## 2. Los workspaces npm no son un artefacto Windows portable

El primer paquete Electron copiaba el workspace y en Windows falló con `ERR_MODULE_NOT_FOUND` para paquetes `@personal-tax-ledger/*`.

Causa raíz: los enlaces de workspace creados en Linux/WSL no eran un árbol de módulos autocontenido válido para el artefacto Windows.

Corrección permanente: staging `.desktop-runtime` con paquetes internos materializados físicamente y rechazo de symlinks.

## 3. La API programática de Electron Packager debe verificarse, no adivinarse

Se probaron incorrectamente export named `package` y default export. La API real de `@electron/packager@20.3.0` expone:

```js
import { packager } from '@electron/packager';
```

Lección: cuando una librería falla por export, inspeccionar su API/version exacta antes de cambiar de estrategia o caer a CLI por descarte.

## 4. Un staging mínimo es mejor que pruning genérico ciego

`asar: true` funcionó. `prune: true` no.

Con pruning genérico, Packager eliminó los paquetes internos materializados porque el staging sintético no los declara como dependencias npm instalables normales.

Decisión final:

```js
asar: true,
prune: false
```

El recorte real lo hace `build-desktop-runtime.mjs`, que conoce explícitamente qué archivos y paquetes son runtime.

## 5. ASAR no es seguridad ni debe confundirse con ella

ASAR ordena y compacta la distribución en `resources/app.asar`; no cifra ni protege criptográficamente el código. La seguridad relevante del renderer se sostiene en `contextIsolation`, `nodeIntegration: false`, sandbox y boundaries arquitectónicos.

## 6. `userData` compartido entre builds es comportamiento correcto

Dos copias del mismo producto mostraron los mismos datos. No era una colisión accidental: ambas resolvían el mismo `app.getPath('userData')`.

Eso confirmó la separación correcta entre binarios y datos y produjo una prueba útil de compatibilidad de upgrade: una build ASAR leyó y modificó datos creados por la build anterior.

## 7. Forge no era necesario para cerrar el gate portable

Electron Forge introdujo dependencias adicionales y fricción con npm 12. El gate portable se cerró con `@electron/packager` directo; el instalador se implementó con `electron-winstaller` directo.

Esto redujo superficie del toolchain sin sacrificar Squirrel.Windows.

## 8. Excepciones temporales de npm no deben quedar por inercia

La excepción local `allow-git=all` fue necesaria durante una etapa con Forge. Tras retirar Forge, `npm ci` funcionó sin `.npmrc`; la excepción se eliminó.

Regla: una excepción de instalación debe revisarse cuando desaparece la dependencia que la justificó.

## 9. Audit de dependencias debe resolverse sin `--force`

`nanoid 3.3.17` llegó transitivamente por tooling. `npm audit fix` lo elevó dentro del rango compatible y dejó `npm audit` en cero vulnerabilidades sin overrides ni `--force`.

## 10. Squirrel desde WSL sí es viable

No era correcto concluir que el instalador debía construirse en Windows nativo sólo porque fallara `CreateZipFromDirectory`.

El build cross-platform finalmente quedó funcionando con Mono + Wine. La causa material del fallo estaba en un helper de Squirrel, no en una imposibilidad estructural de WSL.

## 11. Wine32 puede ser requerido aunque el producto sea x64

PTL, Electron y el instalador objetivo son x64. Sin embargo, Squirrel ejecuta helpers Windows durante el build y el entorno Wine necesitó soporte i386/WoW64.

Esto es una propiedad del host/toolchain, no de la arquitectura del producto final.

## 12. Un prefix Wine creado antes de instalar i386 puede quedar inconsistente

Tras instalar soporte i386, `wineboot -u` falló con `could not load kernel32.dll` porque el prefix existente había sido creado en condiciones incompletas.

Corrección observada:

```bash
mv ~/.wine ~/.wine.bak-$(date +%Y%m%d-%H%M%S)
WINEARCH=win64 WINEPREFIX="$HOME/.wine" wineboot --init
wine cmd /c ver
wineboot -u
```

El nuevo prefix quedó funcional.

## 13. El fallo final de Squirrel era la materialización de 7-Zip

El paquete contenía:

```text
7z-x64.exe
7z-x64.dll
7z-arm64.exe
7z-arm64.dll
```

pero no `7z.exe`/`7z.dll`, que Squirrel esperaba en `CreateZipFromDirectory`.

El script instalado `select-7z-arch.js` además mostraba una selección problemática en el entorno observado. En lugar de depender de un side effect de instalación, PTL ahora materializa los aliases explícitamente desde `create-windows-installer.mjs` usando `os.arch()` y validaciones previas.

Lección: preferir precondiciones deterministas del repo sobre efectos implícitos de lifecycle scripts de dependencias.

## 14. Los problemas de mirrors Ubuntu no deben confundirse con fallos del proyecto

Durante la preparación del host WSL, `apt` quedaba en `Waiting for headers` para mirrors Ubuntu por HTTP, mientras otros repositorios y el tráfico general funcionaban. `curl` confirmó que HTTPS respondía correctamente.

Se cambió `archive.ubuntu.com`/`security.ubuntu.com` a HTTPS. Esto fue un problema de conectividad/routing del host, no de PTL.

## 15. El lifecycle debe probarse sobre datos reales persistidos

No bastó con comprobar que `Setup.exe` abría. Se validó también:

- desinstalación;
- nueva instalación;
- instalación sobre una instalación existente;
- reapertura y continuidad de datos.

Esto confirma el contrato operativo binarios ≠ datos.

## Decisiones que no deben revertirse sin nueva evidencia

- no restaurar roots legacy para Electron;
- no volver a usar symlinks de workspace dentro del artefacto;
- mantener `asar: true`;
- mantener `prune: false` en Packager mientras el staging materializado siga siendo la estrategia;
- mantener pruning explícito en `build-desktop-runtime.mjs`;
- mantener materialización determinista de `7z.exe`/`7z.dll` mientras `electron-winstaller` lo requiera;
- no borrar `userData` en uninstall;
- no introducir auto-update, MSI o firma dentro del gate funcional ya cerrado sin tratarlos como slices separados.