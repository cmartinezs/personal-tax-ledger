# Firma de código Windows

Estado: `IMPLEMENTED_PENDING_CERTIFICATE_AND_NATIVE_VALIDATION`
Prioridad: `P0 BLOCKER`
Gate: `PTL-DIST-WIN-001`

## Motivo

La validación nativa del instalador `0.1.4` evidenció enforcement real de Smart App Control / Code Integrity. `PersonalTaxLedger.exe` fue bloqueado porque el binario no cumplía el nivel de firma exigido por la política `VerifiedAndReputableDesktop`.

Por tanto, la firma deja de ser un polish de distribución y pasa a ser requisito de salida para Windows en equipos con enforcement equivalente.

## Objetivo de la implementación

La pipeline desktop debe poder firmar, sin persistir secretos en el repositorio:

1. los binarios Windows producidos por `@electron/packager`;
2. los artefactos Squirrel producidos por `electron-winstaller`, incluyendo el instalador y los ejecutables auxiliares que el tooling firme;
3. con timestamp RFC3161/Authenticode configurado;
4. fallando de forma explícita cuando un build de distribución exige firma pero la identidad no está configurada.

## Contrato de configuración

La configuración vive únicamente en variables de entorno.

### Modo desactivado

```bash
PTL_WINDOWS_SIGNING_MODE=off
```

Es el default. Permite builds técnicos locales sin certificado, pero esos artefactos **no son aptos para distribución Windows bajo Smart App Control**.

### Modo PFX

```bash
PTL_WINDOWS_SIGNING_MODE=pfx
PTL_WINDOWS_CERTIFICATE_FILE=/ruta/segura/certificate.pfx
PTL_WINDOWS_CERTIFICATE_PASSWORD='...'
PTL_WINDOWS_TIMESTAMP_SERVER='http://timestamp.digicert.com'
```

El archivo y password nunca deben versionarse ni copiarse a staging.

### Modo parámetros SignTool

```bash
PTL_WINDOWS_SIGNING_MODE=params
PTL_WINDOWS_SIGN_WITH_PARAMS='... parámetros del proveedor / identidad de firma ...'
PTL_WINDOWS_TIMESTAMP_SERVER='http://timestamp.digicert.com'
```

Este modo existe para certificados instalados en store, hardware-backed, HSM, proveedores cloud o integraciones donde un PFX exportable no sea apropiado.

### Build que exige firma

```bash
PTL_REQUIRE_WINDOWS_SIGNING=1
```

Cuando está activo, packaging e installer abortan si `PTL_WINDOWS_SIGNING_MODE=off`. Esta variable debe usarse para releases/distribución y para el gate nativo de Smart App Control.

## Integración técnica

`scripts/windows-signing.mjs` centraliza la configuración y la validación de secretos/inputs.

`scripts/package-desktop.mjs` pasa `windowsSign` a `@electron/packager`. Esto permite que los ejecutables Windows del producto sean firmados antes de generar el paquete Squirrel.

`scripts/create-windows-installer.mjs` pasa el mismo contrato `windowsSign` a `electron-winstaller`. El instalador mantiene naming versionado:

```text
PersonalTaxLedger-<version>-Setup.exe
```

El timestamp server default es:

```text
http://timestamp.digicert.com
```

Puede reemplazarse por variable de entorno.

## Seguridad

No se admiten en Git:

- `.pfx`, `.p12`, `.cer` privados;
- passwords/PIN;
- tokens de signing;
- parámetros que embeban secretos;
- credenciales de proveedor cloud.

Los logs de build sólo informan modo, obligatoriedad y timestamp server; no imprimen password ni `PTL_WINDOWS_SIGN_WITH_PARAMS`.

## Gate de cierre

Antes de marcar `PTL-DIST-WIN-001` como DONE se requiere:

1. identidad de firma real configurada;
2. build con `PTL_REQUIRE_WINDOWS_SIGNING=1`;
3. `Get-AuthenticodeSignature PersonalTaxLedger.exe` => `Valid`;
4. `Get-AuthenticodeSignature PersonalTaxLedger-<version>-Setup.exe` => `Valid`;
5. timestamp presente;
6. instalación en Windows con Smart App Control activo;
7. hook post-install exitoso;
8. apertura de PTL sin bypass manual;
9. splash Squirrel + splash interno observados;
10. continuidad del workspace y datos preservada.

## Desarrollo versus distribución

Un certificado autofirmado y confiado manualmente puede utilizarse sólo para comprobar la mecánica de signing en una máquina controlada. No sustituye una identidad de firma apropiada para distribución general ni demuestra reputación Smart App Control/SmartScreen.
