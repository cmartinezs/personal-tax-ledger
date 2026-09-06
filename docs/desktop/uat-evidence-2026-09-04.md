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

## Extensión de evidencia — 2026-09-06

### PTL-DESKTOP-LC-001 — Single-instance explícito

Validación manual sobre la aplicación instalada en Windows x64.

| Caso | Resultado observado |
|---|---|
| Segundo lanzamiento con ventana visible | PASS |
| Segundo lanzamiento con ventana minimizada | PASS |

Comportamiento observado y aceptado:

- no aparece una segunda ventana independiente;
- la instancia existente continúa siendo la experiencia activa;
- cuando la ventana está minimizada, el segundo lanzamiento la restaura;
- la ventana existente recibe foco;
- no se reportaron errores visibles ni pérdida de funcionalidad.

Estado del gate: `PASS / DONE`.

Referencia de backlog: `docs/backlog/desktop-lifecycle-and-distribution.md` → `PTL-DESKTOP-LC-001`.

### PTL-DESKTOP-LC-002 — Reinstalación de la misma versión

Validación manual sobre Windows x64 usando nuevamente el mismo instalador vigente sobre una instalación existente.

Dato marcador utilizado: `LC-002-REINSTALL-TEST`.

| Observación | Resultado |
|---|---|
| Reinstalación misma versión sobre instalación existente | PASS |
| Launch posterior | PASS |
| Dato previo preservado | PASS |
| Duplicación evidente del dato | No observada |
| Error funcional visible | No observado |

La evidencia visual posterior a la reinstalación muestra el registro marcador todavía presente y la aplicación operativa. Durante esta prueba se detectó además un hallazgo UX no bloqueante: contenido tabular largo puede expandir horizontalmente la superficie y provocar scroll horizontal. El hallazgo se deriva a `docs/backlog/ux-and-product-polish.md` y no invalida el gate de lifecycle.

Estado del gate: `PASS / DONE`.

Referencia de backlog: `docs/backlog/desktop-lifecycle-and-distribution.md` → `PTL-DESKTOP-LC-002`.

### PTL-DESKTOP-LC-003 — Desinstalación + reinstalación

Validación manual dedicada sobre Windows x64.

Baseline de persistencia: registro marcador `LC-002-REINSTALL-TEST`, creado antes de la desinstalación.

| Observación | Resultado |
|---|---|
| Desinstalación desde Windows | PASS |
| Reinstalación con el mismo Setup.exe | PASS |
| Launch posterior | PASS |
| Dato previo preservado | PASS |
| Necesidad de recrear manualmente la base | No |
| Residuos que impidieran reinstalar | No observados |
| Error funcional visible | No observado |

Interpretación: la desinstalación elimina la aplicación instalada pero no destruye la persistencia del usuario ubicada fuera del directorio de instalación; una nueva instalación vuelve a abrir la misma información.

Estado del gate: `PASS / DONE`.

Referencia de backlog: `docs/backlog/desktop-lifecycle-and-distribution.md` → `PTL-DESKTOP-LC-003`.

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

Los gates dedicados LC-001, LC-002 y LC-003 están cerrados. La fase extendida de lifecycle continúa con un upgrade real `0.1.0 -> 0.1.1` antes del UAT no técnico. Quedan además fuera de este cierre la firma de código, backup/restore, migraciones de esquema y una política formal de actualización.
