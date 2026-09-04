# Aplicación desktop

`apps/desktop` es el composition root de escritorio basado en Electron.

La primera etapa mantiene intacto el runtime HTTP local existente: Electron inicia `apps/local`, deja que el sistema operativo asigne un puerto local libre, abre la UI compilada y ejecuta el shutdown normal de HTTP + SQLite al cerrar la aplicación. El dominio, los casos de uso y los repositorios actuales no cambian.

## Ejecución técnica

Desde la raíz del repositorio:

```bash
npm run desktop:check
npm run desktop:dev
```

`desktop:dev` compila primero `web/dist` y luego ejecuta Electron 44.2.0 mediante `npx`. Este mecanismo es únicamente el puente de desarrollo y UAT técnico; no es la distribución prevista para usuarios finales.

## Persistencia

La ejecución Electron no utiliza la base dentro del workspace. La base se guarda bajo el directorio `userData` administrado por Electron:

```text
<electron-user-data>/data/personal-tax-ledger.sqlite
```

En Windows ese directorio queda dentro del perfil del usuario. Esto separa datos persistentes del código fuente y prepara futuras actualizaciones sin sobrescribir la información tributaria.

## Seguridad del renderer

La ventana usa:

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- una única instancia de la aplicación

El renderer sigue consumiendo la API local existente. No se expone Node directamente a React.

## Compatibilidad preservada

Los siguientes caminos continúan siendo independientes de Electron:

```bash
npm start
npm run smoke:local
npm test
npm run architecture:check
```

Electron es un adaptador de entrega adicional, no un reemplazo de `apps/local`.

## Próximas etapas

1. Validar el mismo commit en WSL2 y Windows nativo.
2. Incorporar Electron como dependencia reproducible y actualizar `package-lock.json` desde un entorno Node/npm válido.
3. Añadir empaquetado Windows y generar un instalador autocontenido.
4. Añadir logs, backup/restore y diagnóstico de inicio para UAT no técnico.
5. Validar instalación limpia sin Node, npm, Git ni WSL.
