# Perfil local, workspace y startup desktop

Estado: `IMPLEMENTED_PENDING_NATIVE_VALIDATION`
Versión preparada para UAT nativo: `0.1.2`

## Alcance implementado

### Perfil local

PTL incorpora una configuración bootstrap local independiente de la base tributaria principal. El perfil contiene actualmente:

- nombre o alias;
- RUT;
- residencia tributaria;
- tipo de actividad habitual (dependiente, independiente o mixta);
- año comercial preferido;
- AFP por defecto;
- sistema de salud por defecto;
- régimen APV preferido;
- notas tributarias personales.

No incorpora autenticación cloud, contraseñas, claves tributarias ni secretos.

La configuración se guarda en `bootstrap.json` bajo el `userData` de Electron mediante escritura temporal + rename. El archivo contiene `schemaVersion`, estado de first-run, última versión observada, perfil activo, workspace activo y, cuando corresponde, un cambio de workspace pendiente.

## Workspace

El workspace activo es explícito y su base se resuelve como:

```text
<workspace>/data/personal-tax-ledger.sqlite
```

El workspace por defecto es el `userData` que ya utilizaban las versiones desktop previas. Esta decisión preserva de forma transparente la base histórica existente:

```text
legacy/current:
<userData>/data/personal-tax-ledger.sqlite

bootstrap default:
activeWorkspace.path = <userData>
```

Por lo tanto, introducir workspaces no obliga a mover ni recrear los datos actuales.

### Cambio de workspace

La UI desktop utiliza un file/folder picker nativo expuesto mediante un preload mínimo con `contextIsolation: true`, `nodeIntegration: false` y bridge IPC explícito.

Se soportan tres modos:

- `OPEN_EXISTING`: abre una carpeta que ya contiene una base PTL válida;
- `ADOPT_CURRENT`: copia la base actual a una carpeta nueva;
- `CREATE_NEW`: crea un workspace vacío.

Los cambios que modifican la ubicación de la base no se aplican mientras SQLite está abierta. Se persisten como `pendingWorkspace`, se cierra el runtime de forma controlada y se aplican antes de abrir la base en el siguiente arranque.

Para `ADOPT_CURRENT`, la copia ocurre antes de abrir SQLite. Si el destino ya contiene una base se aborta para evitar sobrescritura silenciosa.

## Splash y bootstrap visible

Electron muestra una ventana splash independiente antes de iniciar el runtime local y mantiene oculta la ventana principal hasta `ready-to-show`.

Flujo:

```text
single-instance
  -> resolver bootstrap
  -> splash
  -> resolver workspace
  -> DB_PATH del workspace
  -> iniciar runtime local
  -> cargar frontend
  -> ready-to-show
  -> mostrar main window
  -> cerrar splash
```

El splash diferencia:

- `FIRST_RUN`;
- `UPDATED`;
- `NORMAL`.

No muestra porcentajes ficticios; sólo una indicación visual de actividad.

## First-run onboarding

Cuando `firstRunCompleted=false`, la UI principal no se muestra directamente. Se presenta un onboarding con cuatro etapas:

1. bienvenida;
2. perfil local;
3. workspace;
4. revisión.

Si se mantiene el workspace por defecto, el usuario entra a PTL sin migración. Si elige otra carpeta, el cambio se aplica mediante reinicio controlado.

## Configuración posterior

Después del onboarding, la aplicación expone `Cuenta y workspace`, desde donde se pueden modificar:

- perfil local;
- defaults tributarios personales;
- nombre del workspace;
- carpeta del workspace;
- política de apertura/adopción/creación al cambiar.

La configuración tributaria anual existente permanece separada del bootstrap local.

## Primera apertura post-upgrade

El bootstrap mantiene `lastSeenVersion`. Si el perfil ya completó first-run y la versión instalada es distinta a la última observada, el arranque se clasifica como `UPDATED` y el splash lo comunica. La versión se marca como observada sólo después de que la ventana principal llega correctamente a `ready-to-show`.

Esto prepara el punto de integración para `PTL-DATA-002` (migraciones formales de esquema), que todavía no está implementado.

## Seguridad

El preload expone sólo cinco operaciones delimitadas:

- leer bootstrap;
- actualizar bootstrap;
- seleccionar carpeta;
- inspeccionar carpeta;
- reiniciar PTL.

No expone `fs`, shell ni APIs Node genéricas al renderer.

## Pruebas automatizadas agregadas

`test/desktop-bootstrap-config.test.mjs` cubre:

- adopción del `userData` histórico como workspace por defecto;
- persistencia del perfil bootstrap;
- adopción de la base actual a un nuevo workspace;
- rechazo de `OPEN_EXISTING` sobre una carpeta sin base PTL.

## Preparación reproducible `0.1.2` — PASS

Validación ejecutada el 2026-09-06 antes del gate nativo Windows:

- baseline canónica: `0.1.1`;
- `npm ci`: PASS / exit 0;
- `npm audit`: 0 vulnerabilidades;
- `npm run typecheck`: PASS / exit 0;
- `npm test`: 111 tests, 111 PASS, 0 FAIL;
- `npm run desktop:check`: PASS / exit 0;
- `npm run architecture:check`: PASS / exit 0;
- bump: `0.1.1 -> 0.1.2`;
- `npm run desktop:installer:win`: PASS / exit 0;
- artefactos generados:
  - `PersonalTaxLedger-0.1.2-full.nupkg`;
  - `PersonalTaxLedger-Setup.exe`;
  - `RELEASES`;
- commit de versión: `a0a1390 release: prepare desktop profile and workspace validation 0.1.2`;
- push a `master`: PASS.

## Gate nativo pendiente

El slice queda `IMPLEMENTED_PENDING_NATIVE_VALIDATION` hasta observar en Windows:

1. instalación `0.1.2` sobre la `0.1.1` existente;
2. splash de post-upgrade antes de la ventana principal;
3. first-run onboarding para introducir perfil/workspace sin perder la base histórica;
4. preservación del marcador y datos existentes;
5. edición posterior de perfil desde `Cuenta y workspace`;
6. selección de un workspace nuevo;
7. `ADOPT_CURRENT` y reinicio controlado;
8. apertura posterior usando la copia adoptada;
9. persistencia del perfil y workspace activo tras cerrar y abrir de nuevo;
10. ausencia de creación silenciosa de una base vacía o pérdida de datos.

Una vez observado lo anterior, este slice puede cerrarse como `DONE` y habilitar formalmente `PTL-DATA-001` sobre el workspace explícito.