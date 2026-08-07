# Ejecución local en Windows

`apps/local` es la misma aplicación local en Windows, Linux y macOS. No existe una aplicación Windows separada.

## PowerShell

```powershell
npm ci
npm run build:packages
Set-Location apps/local/web
npx --no-install vite build
Set-Location ..
```

Para validar el runtime en otra terminal:

```powershell
npm run smoke:local
```

La base se guarda en `server/data/apv-chile.sqlite` por defecto. Se puede usar otra ubicación:

```powershell
```

## CMD

```cmd
npm ci
npm run build:packages
cd apps/local/web
npx --no-install vite build
cd ..
```

Con una base alternativa:

```cmd
set DB_PATH=%CD%\data\personal-tax-ledger.sqlite
npm start
```

Detener la aplicación con `Ctrl+C`. El proceso libera la conexión SQLite y el puerto HTTP mediante el shutdown normal de `apps/local`.
