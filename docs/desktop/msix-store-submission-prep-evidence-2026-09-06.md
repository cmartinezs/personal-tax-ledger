# MSIX Store submission preparation evidence — 2026-09-06

Estado: `PASS`

## Alcance

Evidencia del gate de preparación del primer artefacto MSIX de `Personal Tax Ledger` para Microsoft Store, versión `0.1.5.0`.

## Resultado observado

- `master` sincronizado correctamente desde WSL;
- `scripts/build-msix-store-submission.ps1` presente y ejecutado;
- artefacto generado: `PersonalTaxLedger-0.1.5.0-x64-store.msix`;
- tamaño observado: `163545577` bytes;
- SHA-256 observado: `3143FB6C181A80D42FE638D3979092BEA098C7C26B43D1BA7E87CD5F0FAFCC5F`;
- Authenticode del artefacto Store: `NotSigned`, esperado para este lane de submission MSIX;
- Windows App Certification Kit detectado en el Windows SDK;
- resultado del wrapper: `PTL STORE SUBMISSION PREP: PASS`.

## Interpretación

El artefacto Store se mantiene deliberadamente sin la firma self-signed usada para sideload/UAT. Microsoft Store vuelve a firmar el paquete MSIX tras certificación. La firma self-signed de desarrollo no representa la identidad pública de distribución.

## Siguiente gate

Ejecutar Windows App Certification Kit (WACK) sobre el artefacto Store y revisar el reporte antes de cargar el paquete a Partner Center.
