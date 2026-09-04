# Aplicación desktop

`@personal-tax-ledger/desktop-app` será el composition root de escritorio basado en Electron.

La primera etapa mantiene intacto el runtime HTTP local existente: Electron inicia `apps/local`, espera que el servidor quede disponible, abre la UI empaquetada y ejecuta el shutdown normal al cerrar la ventana. Esto permite validar Windows sin modificar el dominio, los casos de uso ni los repositorios SQLite actuales.

## Objetivos de esta etapa

- Preservar `apps/local` como baseline estable y ejecutable fuera de Electron.
- Reutilizar el mismo frontend compilado desde `web/dist`.
- Mantener SQLite y el application layer existentes.
- Evitar dependencias de WSL o Bash en el runtime del usuario final.
- Preparar el camino a un instalador Windows autocontenido.

## Estado

Scaffold inicial. La incorporación de la dependencia Electron y del empaquetador se realizará junto con la validación nativa de Windows para mantener `npm ci` y el lockfile reproducibles.
