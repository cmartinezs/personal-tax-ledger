# Microsoft Store + MSIX distribution lane

Estado: `IMPLEMENTED_PENDING_NATIVE_VALIDATION`

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
0.1.4 -> 0.1.4.0
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

El wrapper localiza `MakeAppx.exe` y, opcionalmente, `SignTool.exe` en Windows SDK.

Ejemplo conceptual:

```powershell
.\scripts\package-msix.ps1 \
  -StagingDirectory <staging> \
  -OutputPackage <PersonalTaxLedger-x64.msix>
```

Para una submission de Store, el paquete no necesita una identidad de firma pública propia: la Store vuelve a firmarlo después de la certificación.

### Firma de desarrollo local

`scripts/windows-msix-dev-cert.ps1`

Crea un certificado RSA self-signed exclusivamente para desarrollo/UAT controlado, lo instala en los stores de confianza del usuario local y permite firmar un MSIX local para sideload testing.

No es una identidad de distribución pública y nunca debe interpretarse como sustituto de la firma de Store o de una CA pública.

## Scripts npm

```text
npm run desktop:msix:prepare
npm run desktop:msix:prepare:store
```

`desktop:check` valida también los módulos JS de MSIX.

## Evidencia de preparación reproducible

Validación ejecutada el 2026-09-06 sobre `0.1.4`:

- sync de `master`: PASS;
- `npm run desktop:check`: exit 0;
- `npm test`: 111/111 PASS, 0 FAIL;
- `npm run desktop:msix:prepare`: exit 0;
- staging generado en `out/msix/staging`;
- identidad dev generada: `PersonalTaxLedger.Dev`;
- publisher dev: `CN=Personal Tax Ledger Development`;
- versión MSIX: `0.1.4.0`;
- manifiesto válido generado con `Windows.FullTrustApplication` y `runFullTrust`;
- assets obligatorios presentes;
- `PersonalTaxLedger.exe` presente en staging.

Resultado: `PTL MSIX PREPARATION: PASS`.

## Evidencia de identidad Store

Validación ejecutada el 2026-09-06 sobre `0.1.4` después de persistir los valores reales de Partner Center:

- `desktop:check`: exit 0;
- `desktop:msix:prepare:store`: exit 0;
- mode: `store`;
- identity: `Admn.PersonalTaxLedger`;
- publisher: `CN=5D12CBCA-3417-412D-81A4-21E062DB93F5`;
- publisher display name: `Adümün`;
- version: `0.1.4.0`;
- `AppxManifest.xml` contiene exactamente los tres valores esperados;
- checks explícitos de identity name, publisher y publisher display name: PASS.

Resultado: `PTL MSIX STORE IDENTITY: PASS`.

Esto cierra el gate de preparación determinista y el gate de identidad de Partner Center. Permanecen pendientes el empaquetado con Windows SDK y la validación nativa.

## Riesgos y gates pendientes

### Windows SDK

La etapa `MakeAppx.exe` requiere un host con Windows SDK Packaging Tools. No se introduce Node/Git/npm en el host Windows de UAT por esta decisión; el staging se sigue preparando desde el entorno de build y el empaquetado MSIX puede ejecutarse en un host/tooling separado.

### Persistencia y workspace bajo MSIX

MSIX cambia el contexto de identidad del proceso y puede introducir redirección/virtualización de paths de AppData. Por ello no se asume que el `userData` histórico de Squirrel sea idéntico bajo MSIX.

Gate obligatorio antes de migrar usuarios existentes:

```text
Squirrel install con datos existentes
-> instalar MSIX de prueba
-> observar app.getPath('userData') real
-> verificar bootstrap.json / SQLite
-> validar workspace explícito
-> definir migración o adopción si los paths difieren
```

### Loopback local

PTL levanta un HTTP runtime local y el renderer consume `127.0.0.1`. Debe validarse explícitamente dentro del contexto MSIX/Store; no se declara compatible hasta pasar el gate nativo.

## DoD del slice Microsoft Store/MSIX

El slice puede considerarse `DONE` cuando:

- cuenta de Store operativa;
- nombre reservado;
- identidad de Partner Center persistida; ✅
- manifest Store validado contra Partner Center; ✅
- MSIX generado con manifest válido;
- paquete instalado y ejecutado en Windows nativo;
- Smart App Control no bloquea la instalación/ejecución del paquete firmado por el canal correspondiente;
- runtime local y frontend funcionan;
- perfil/workspace funcionan;
- persistencia histórica/migración está resuelta;
- submission de Store supera validación/certificación o queda documentado un blocker externo concreto.
