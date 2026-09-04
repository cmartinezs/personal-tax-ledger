# Ruta desktop con Electron

Personal Tax Ledger adopta Electron como superficie desktop para Windows, preservando el runtime local existente como baseline estable durante la transición.

## Principio de compatibilidad

Electron es un adaptador de entrega adicional. No reemplaza `apps/local`, no mueve lógica tributaria al proceso Electron y no expone Node al renderer React.

```mermaid
flowchart LR
    U[Usuario Windows] --> E[Electron]
    E --> L[apps/local]
    L --> H[HTTP local efímero]
    H --> W[React apps/local/web/dist]
    L --> A[Application]
    A --> C[Core tributario]
    A --> S[SQLite adapter]
    S --> DB[(SQLite en userData)]
```

## Etapa 1: wrapper compatible

La primera implementación ejecuta la misma aplicación local existente dentro del lifecycle de Electron:

1. Electron obtiene su directorio `userData`.
2. Define `DB_PATH` hacia `userData/data/personal-tax-ledger.sqlite`.
3. Crea `apps/local` con puerto `0` para que el sistema operativo asigne un puerto libre.
4. Espera el inicio del servidor.
5. Abre `BrowserWindow` contra el endpoint local.
6. Al cerrar, invoca `createLocalApp().stop()` para cerrar HTTP y SQLite ordenadamente.

## Perfiles de ejecución

| Perfil | Runtime | Propósito |
|---|---|---|
| DEV | WSL2/Ubuntu + Node/npm | Desarrollo y debugging |
| UAT técnico | Windows nativo, sin requerir Git ni Node para ejecutar el artefacto | Validar compatibilidad, persistencia y lifecycle |
| UAT usuario | Windows nativo + instalador autocontenido | Validar experiencia no técnica |

## Criterios de estabilidad

Durante la transición deben continuar pasando, sin depender de Electron:

```text
npm test
npm run build
npm run smoke:local
npm run architecture:check
npm start
```

El camino desktop añade:

```text
npm run desktop:check
npm run desktop:dev
npm run desktop:package
npm run desktop:package:win
```

## Dependencias reproducibles

La rama desktop fija explícitamente:

- `electron` 44.2.0;
- `@electron-forge/cli` 7.11.2.

El `package-lock.json` debe mantenerse sincronizado antes de volver a usar `npm ci`.

## Empaquetado Windows: gate portable

El primer gate de distribución es un paquete Windows x64 generado por Electron Forge, no un instalador. Se genera con:

```text
npm run desktop:package:win
```

La salida queda bajo `out/` y debe poder copiarse a Windows y ejecutarse sin Git, Node, npm ni WSL.

Para reducir variables durante este gate inicial, `forge.config.cjs` usa temporalmente:

- `asar: false`;
- `prune: false`;
- `makers: []`.

Esto prioriza compatibilidad y diagnósticos sobre tamaño. Una vez validado el runtime portable, el siguiente gate habilita poda/ASAR y posteriormente un maker de instalador Windows.

## Seguridad inicial

La ventana desktop ejecuta el renderer con:

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- single-instance lock

## Gates siguientes

```mermaid
flowchart LR
    A[Electron dev estable] --> B[Portable Windows x64]
    B --> C[Persistencia y restart]
    C --> D[Optimizar package]
    D --> E[Installer Windows]
    E --> F[Firma de código]
    F --> G[UAT usuario]
```

La firma de código se incorpora en el gate de distribución final; no bloquea la validación técnica del paquete portable inicial.
