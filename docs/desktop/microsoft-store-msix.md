# Microsoft Store + MSIX distribution lane

Estado: `IMPLEMENTED_PENDING_STORE_CERTIFICATION`

## Decisión

Personal Tax Ledger adopta Microsoft Store + MSIX como vía principal candidata para distribución pública Windows sin exigir la compra de un certificado de firma de código.

La vía Squirrel/EXE se conserva para desarrollo técnico, compatibilidad y trabajo histórico, pero deja de ser la única estrategia de distribución pública.

## Motivación

Microsoft Store vuelve a firmar los paquetes MSIX aceptados por la Store. Esto evita exigir al proyecto la compra y custodia de un certificado OV para la vía principal de distribución.

La decisión no elimina los requisitos de identidad de Publisher ni la certificación de Store. El `Identity Name` y el `Publisher` del manifiesto de producción deben coincidir exactamente con los valores reservados para la aplicación en Partner Center.

## Identidad canónica de Microsoft Store

Nombre reservado: `Personal Tax Ledger`

Valores asignados por Partner Center:

```text
Package/Identity/Name: Admn.PersonalTaxLedger
Package/Identity/Publisher: CN=5D12CBCA-3417-412D-81A4-21E062DB93F5
Package/Properties/PublisherDisplayName: Adümün
Package Family Name (PFN): Admn.PersonalTaxLedger_eraxmwbat6msg
Store ID: 9N8NR29965DS
Store URL: https://apps.microsoft.com/detail/9N8NR29965DS
Store protocol link: ms-windows-store://pdp/?productid=9N8NR29965DS
```

El `MSA app Id` mostrado por Partner Center no forma parte del manifiesto MSIX y no se usa en el packaging actual de PTL.

Estos valores son identidad pública de paquete/producto, no secretos. `scripts/msix-config.mjs` los conserva como defaults canónicos para `PTL_MSIX_MODE=store`. Las variables de entorno siguen pudiendo sobrescribirlos de forma explícita para validaciones controladas, pero un build normal de Store no requiere volver a introducirlos manualmente.

## Implementación agregada

### Contrato de identidad

`scripts/msix-config.mjs`

Variables:

- `PTL_MSIX_MODE=dev|store`;
- `PTL_MSIX_IDENTITY_NAME`;
- `PTL_MSIX_PUBLISHER`;
- `PTL_MSIX_PUBLISHER_DISPLAY_NAME`;
- `PTL_MSIX_MIN_WINDOWS_VERSION`;
- `PTL_MSIX_MAX_WINDOWS_VERSION_TESTED`.

En modo `store`, si no hay overrides explícitos, se usan los valores canónicos persistidos desde Partner Center.

La versión npm se normaliza a la forma MSIX de cuatro componentes, por ejemplo:

```text
0.1.5 -> 0.1.5.0
```

### Staging determinista

`scripts/prepare-msix.mjs`

El script:

1. parte del paquete Electron Windows ya construido;
2. crea `out/msix/staging`;
3. copia la aplicación Win32 completa;
4. genera `AppxManifest.xml`;
5. materializa assets gráficos mínimos reproducibles;
6. genera `out/msix/msix-build.json` con identidad, versión y SHA-256 del manifiesto.

El manifiesto usa `Windows.FullTrustApplication` y la capability restringida `runFullTrust`, apropiada para un desktop Win32 empaquetado mediante Desktop Bridge.

### Packaging en host Windows SDK

`scripts/package-msix.ps1`

El wrapper localiza `MakeAppx.exe` y, opcionalmente, `SignTool.exe` en Windows SDK. Para firma de desarrollo, si no se entrega `CertificateSubject`, deriva automáticamente el Subject desde `Identity/@Publisher` del `AppxManifest.xml`, evitando desalinear la firma con la identidad real del paquete.

### Firma de desarrollo local

`scripts/windows-msix-dev-cert.ps1`

Crea un certificado RSA self-signed exclusivamente para desarrollo/UAT controlado y permite firmar un MSIX local para sideload testing.

Este certificado resuelve la confianza necesaria para instalar el paquete en una máquina de desarrollo controlada, pero **no constituye una identidad pública confiable para Smart App Control**. No debe usarse como sustituto de la firma que Microsoft Store aplica después de la certificación ni de un certificado emitido por una CA reconocida por el Microsoft Trusted Root Program.

### Sideload de prueba en un comando

`scripts/build-msix-sideload.ps1` orquesta el tramo Windows de UAT:

1. lee el publisher real desde `AppxManifest.xml`;
2. crea o reutiliza un certificado self-signed con Subject exactamente igual al publisher del paquete;
3. empaqueta con `MakeAppx.exe`;
4. firma con `SignTool.exe`;
5. valida que `Get-AuthenticodeSignature` devuelva `Valid`;
6. deja el `.msix` firmado en el Desktop de Windows por defecto.

El certificado es sólo para sideload local controlado. La Store reemplaza esa firma en el canal público.

## Scripts npm

```text
npm run desktop:msix:prepare
npm run desktop:msix:prepare:store
```

`desktop:check` valida también los módulos JS de MSIX.

## Evidencia cerrada

### Preparación reproducible 0.1.5

Validación ejecutada el 2026-09-06:

- `npm ci`: PASS, 0 vulnerabilities;
- typecheck: PASS;
- tests: 111/111 PASS;
- `desktop:check`: PASS;
- `architecture:check`: PASS;
- staging Store real: PASS;
- identity: `Admn.PersonalTaxLedger`;
- publisher: `CN=5D12CBCA-3417-412D-81A4-21E062DB93F5`;
- version: `0.1.5.0`;
- runtime local por defecto: `127.0.0.1`;
- desktop fuerza `host: 127.0.0.1`.

Resultado: `PTL MSIX 0.1.5 PREPARATION: PASS`.

### Instalación MSIX 0.1.4

- MSIX self-signed instaló correctamente después de confiar el certificado de desarrollo en el equipo;
- la aplicación abrió y reutilizó `C:\Users\carlo\AppData\Roaming\Personal Tax Ledger`;
- `bootstrap.json` y SQLite históricos se conservaron;
- no se observó una copia alternativa de la base dentro de `AppData\Local\Packages\<PFN>`;
- coexistió con la instalación Squirrel 0.1.3, ambas usando el mismo workspace histórico.

Resultado: compatibilidad de `userData` y workspace entre Squirrel y MSIX observada como PASS para este equipo.

### Upgrade MSIX 0.1.4.0 -> 0.1.5.0

El paquete `0.1.5.0`:

- fue reconocido por App Installer como actualización de `0.1.4.0`;
- se instaló correctamente como update in-place;
- mantuvo identidad de paquete y PFN;
- al intentar ejecutar la aplicación, Smart App Control bloqueó `Admn.PersonalTaxLedger_eraxmwbat6msg!PTL` con el mensaje de que no pudo verificar su publisher;
- Windows mostró además `An Application Control policy has blocked this file` sobre `PersonalTaxLedger.exe`.

Conclusión: **la firma self-signed del paquete es suficiente para sideload/instalación en una máquina que confía explícitamente ese certificado, pero no es suficiente para superar Smart App Control en modo enforcement**.

Esto corrige una hipótesis anterior: no debe usarse el sideload self-signed como gate de aceptación de Smart App Control.

## Smart App Control: gate correcto

Smart App Control aplica controles de reputación/firma sobre ejecutables. Si Microsoft App Intelligence no reconoce un binario como seguro, la vía soportada es que esté firmado con un certificado emitido por un proveedor confiable del Microsoft Trusted Root Program.

Por lo tanto, para PTL hay dos gates distintos:

```text
DEV / SIDELOAD LOCAL
  MSIX self-signed
  -> instalación local
  -> upgrade semantics
  -> manifest/package identity
  -> persistencia/workspace
  -> NO acredita compatibilidad con Smart App Control

PUBLIC / STORE
  submission MSIX a Microsoft Store
  -> certificación
  -> Microsoft re-signing
  -> instalación desde Store
  -> ejecución con Smart App Control activo
  -> gate definitivo
```

No se desactiva Smart App Control para declarar el canal público como compatible.

## Riesgos y gates pendientes

### Loopback local

El fix `0.1.5` restringe el servidor local a `127.0.0.1`. La construcción y el staging lo validan estáticamente, pero la ejecución nativa de `0.1.5` quedó bloqueada por Smart App Control antes de poder observar el listener. La comprobación runtime queda trasladada al build certificado por Microsoft Store o a otro entorno de UAT donde la política permita ejecutar builds de desarrollo sin rebajar el gate público.

### Persistencia post-upgrade

La instalación MSIX 0.1.5 como actualización fue aceptada. La ejecución fue bloqueada antes de poder comprobar en runtime el estado posterior al upgrade. La evidencia anterior de 0.1.4 demuestra que el canal MSIX puede reutilizar el `userData` histórico, pero la comprobación post-upgrade 0.1.5 queda pendiente del primer build ejecutable bajo una identidad confiable.

## DoD del slice Microsoft Store/MSIX

El slice puede considerarse `DONE` cuando:

- cuenta de Store operativa; ✅
- nombre reservado; ✅
- identidad de Partner Center persistida; ✅
- manifest Store validado contra Partner Center; ✅
- Windows SDK packaging tools disponibles; ✅
- MSIX generado con manifest válido; ✅
- MSIX firmado para sideload local con Authenticode `Valid`; ✅
- instalación MSIX nativa funciona; ✅
- upgrade in-place `0.1.4.0 -> 0.1.5.0` es reconocido por App Installer; ✅
- compatibilidad de `userData`/workspace con el canal Squirrel observada; ✅
- submission de Store preparada;
- Microsoft Store certifica y vuelve a firmar el paquete;
- build descargado desde Store ejecuta con Smart App Control activo;
- runtime local escucha sólo en `127.0.0.1`;
- perfil/workspace y datos históricos funcionan después del upgrade;
- canal Squirrel legacy puede retirarse de forma controlada.
