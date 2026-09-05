# Evidencia UAT técnica desktop — 2026-09-04

## Alcance

Validación manual en Windows nativo de la ruta desktop de Personal Tax Ledger generada desde WSL2/Ubuntu.

## Evidencia observada

| Prueba | Resultado |
|---|---|
| Ejecutar portable `PersonalTaxLedger.exe` sin Git/Node/npm/WSL en Windows | PASS |
| Resolver paquetes `@personal-tax-ledger/*` materializados | PASS |
| Cargar interfaz React | PASS |
| Crear/modificar datos | PASS |
| Cerrar y reabrir | PASS |
| Persistir SQLite entre ejecuciones | PASS |
| Ejecutar build ASAR | PASS |
| Leer datos creados por build anterior | PASS |
| Generar `PersonalTaxLedger-Setup.exe` desde WSL | PASS |
| Ejecutar Setup.exe en Windows | PASS |
| Iniciar aplicación instalada | PASS |
| Desinstalar | PASS |
| Instalar nuevamente después de desinstalar | PASS |
| Instalar sobre instalación existente | PASS |
| Conservar datos durante lifecycle de instalación | PASS |

## Evidencia negativa útil

### `prune: true`

Resultado: FAIL controlado.

Síntoma: `ERR_MODULE_NOT_FOUND` para `@personal-tax-ledger/contracts`.

Causa: pruning genérico eliminó paquetes internos físicamente materializados porque el staging sintético no los declaraba como dependencias npm convencionales.

Decisión: `prune: false` y pruning determinista propio.

### Squirrel sin aliases 7-Zip

Resultado: FAIL controlado.

Síntoma: `Squirrel.Utility.CreateZipFromDirectory` / `ShellExecuteEx failed: File not found`.

Causa: existían `7z-x64.exe/.dll`, pero no los aliases `7z.exe/.dll` esperados por Squirrel.

Decisión: materialización explícita en `scripts/create-windows-installer.mjs`.

## Configuración que produjo PASS

```text
Electron                 44.2.0
@electron/packager       20.3.0
electron-winstaller      5.4.4
Target                    win32-x64
ASAR                      true
Packager prune            false
Pruning efectivo          build-desktop-runtime.mjs
Installer                 Squirrel.Windows EXE
MSI                       disabled
Delta packages            disabled
DB                        Electron userData/data/personal-tax-ledger.sqlite
```

## Interpretación

El gate de distribución desktop funcional se considera cerrado. Quedan fuera de este cierre la firma de código, una política de auto-update y el UAT de usuario no técnico.