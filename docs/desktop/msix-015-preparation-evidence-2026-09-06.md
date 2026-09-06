# MSIX 0.1.5 preparation evidence — 2026-09-06

Estado: `PASS`

## Objetivo

Preparar el upgrade MSIX `0.1.4.0 -> 0.1.5.0` para validar en Windows nativo que el runtime HTTP local queda restringido a loopback y que la actualización conserva `userData`, perfil, workspace y SQLite históricos.

## Evidencia de preparación

La ejecución `PTL — MSIX 0.1.5 PREPARATION` confirmó:

- `master` sincronizado;
- versión raíz `0.1.5`;
- `package-lock.json` ya sincronizado a `0.1.5`;
- `npm ci`: exit 0;
- 0 vulnerabilidades reportadas por npm;
- `typecheck`: exit 0;
- tests: `111/111 PASS`, `0 FAIL`;
- `desktop:check`: exit 0;
- `architecture:check`: exit 0;
- límites arquitectónicos preservados;
- staging MSIX Store generado correctamente;
- identidad: `Admn.PersonalTaxLedger`;
- publisher: `CN=5D12CBCA-3417-412D-81A4-21E062DB93F5`;
- publisher display name: `Adümün`;
- versión MSIX: `0.1.5.0`;
- arquitectura: `x64`;
- manifest Store validado contra identidad canónica;
- default host local: `127.0.0.1`;
- `server.listen(port, host)` usa host explícito;
- desktop fuerza `host: '127.0.0.1'`;
- resultado final: `PTL MSIX 0.1.5 PREPARATION: PASS`.

## Gate nativo siguiente

El siguiente gate debe ejecutarse como actualización in-place sobre el MSIX `0.1.4.0` ya instalado:

```text
0.1.4.0 instalado
-> construir y firmar 0.1.5.0 para sideload
-> instalar 0.1.5.0 sobre 0.1.4.0
-> lanzar PTL
-> verificar sin nuevo prompt de Firewall
-> verificar listener = 127.0.0.1
-> verificar mismo userData
-> verificar mismo workspace
-> verificar misma SQLite / datos funcionales
```

La instalación Squirrel `0.1.3` se mantiene temporalmente sin tocar hasta cerrar este gate y luego será retirada de forma controlada.

## DoD de este gate

- artefacto `PersonalTaxLedger-0.1.5.0-x64-sideload.msix` creado;
- firma Authenticode local válida;
- upgrade MSIX aceptado por Windows;
- aplicación inicia normalmente;
- Smart App Control no bloquea;
- no aparece un nuevo requerimiento de acceso de red por el runtime PTL;
- socket local enlazado exclusivamente a `127.0.0.1`;
- `bootstrap.json` histórico sigue siendo el activo;
- workspace histórico sigue siendo el activo;
- SQLite histórica sigue siendo la utilizada;
- sin duplicación de base bajo el package data root de MSIX.
