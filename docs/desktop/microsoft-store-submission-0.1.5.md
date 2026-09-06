# Microsoft Store submission 0.1.5

Estado: `READY_TO_BUILD_AND_SUBMIT`

## Objetivo

Preparar y enviar la primera submission real de Personal Tax Ledger como MSIX usando la identidad ya reservada en Partner Center.

Identidad:

```text
Package/Identity/Name: Admn.PersonalTaxLedger
Package/Identity/Publisher: CN=5D12CBCA-3417-412D-81A4-21E062DB93F5
Package/Properties/PublisherDisplayName: Adümün
PFN: Admn.PersonalTaxLedger_eraxmwbat6msg
Store ID: 9N8NR29965DS
Version: 0.1.5.0
Architecture: x64
```

## Artefacto de submission

El artefacto para Partner Center se genera con:

```powershell
scripts/build-msix-store-submission.ps1
```

Salida por defecto:

```text
%USERPROFILE%\Desktop\PTL-Store-Submission\
  PersonalTaxLedger-0.1.5.0-x64-store.msix
  AppxManifest.xml
  msix-build.json
  store-submission-build.txt
```

El paquete Store se crea **sin aplicar la firma self-signed de desarrollo**. Esa firma sólo existe para sideload/UAT local. Microsoft Store vuelve a firmar el MSIX después de que la submission supera certificación.

El script valida antes de declarar PASS:

- staging en modo `store`;
- identity exacta de Partner Center;
- publisher exacto;
- `PublisherDisplayName=Adümün`;
- versión `0.1.5.0`;
- arquitectura `x64`;
- creación correcta mediante `MakeAppx.exe`;
- SHA-256 del artefacto;
- round-trip unpack del MSIX;
- identidad, versión y arquitectura después del unpack.

## Windows App Certification Kit

Antes de enviar se debe ejecutar:

```powershell
scripts/run-msix-store-wack.ps1
```

Ruta esperada del WACK:

```text
C:\Program Files (x86)\Windows Kits\10\App Certification Kit\appcert.exe
```

El wrapper ejecuta:

```text
appcert.exe reset
appcert.exe test -appxpackagepath <package> -reportoutputpath <report>
```

Salida:

```text
%USERPROFILE%\Desktop\PTL-Store-Submission\WACK\
  ptl-wack-run.txt
  ptl-wack-report.xml
```

Un resultado no exitoso debe analizarse antes de enviar a certificación.

## Restricted capability: runFullTrust

El manifiesto declara:

```xml
<rescap:Capability Name="runFullTrust" />
```

Partner Center requiere justificar las restricted capabilities declaradas. Texto recomendado para la submission:

> Personal Tax Ledger is a packaged Win32/Electron desktop application. It requires runFullTrust to execute its desktop process, access the user-selected local workspace and SQLite database, and run a loopback-only HTTP runtime on 127.0.0.1 used exclusively for communication between the local desktop process and its renderer. The application does not expose this runtime to the local network or Internet.

No declarar otras restricted capabilities salvo que el manifiesto cambie.

## Privacy policy

Fuente pública preparada:

```text
site/privacy.html
```

URL esperada una vez publicada la proyección de GitHub Pages:

```text
https://cmartinezs.github.io/personal-tax-ledger/privacy.html
```

La política describe el comportamiento actual: almacenamiento local, workspace seleccionado por el usuario y ausencia de transmisión de los datos tributarios a un backend propio en la versión actual.

La URL debe estar publicada y comprobada antes de cerrar la submission.

## Partner Center: secciones de la primera submission

### Pricing and availability

Para esta primera publicación:

- precio: Free;
- trial: no;
- markets: los mercados deseados por el publisher;
- publishing hold: opcional según se quiera publicar inmediatamente después de certification.

### Properties

Seleccionar una categoría coherente con una herramienta de finanzas/productividad personal. No declarar capacidades adicionales no presentes en el producto.

### Age ratings

Responder el cuestionario según el contenido real de PTL. La aplicación no tiene contenido sexual, violencia, apuestas ni contenido maduro como parte de su funcionalidad tributaria.

### Packages

Subir:

```text
PersonalTaxLedger-0.1.5.0-x64-store.msix
```

No subir:

- `PersonalTaxLedger-0.1.5.0-x64-sideload.msix`;
- `PersonalTaxLedger-Development.cer`;
- Setup.exe/Squirrel;
- bases SQLite, bootstrap personal o logs privados.

### Store listing

Preparar al menos:

- nombre: `Personal Tax Ledger`;
- descripción breve y descripción completa;
- al menos una captura real de la aplicación;
- Store logo;
- privacy policy URL;
- características principales sin afirmar capacidades no existentes.

### Submission options

En Restricted capabilities incluir la justificación de `runFullTrust` indicada arriba.

En Notes for certification conviene explicar:

- que PTL es local-first;
- que no necesita login;
- que el servidor HTTP se limita a `127.0.0.1` y sólo enlaza renderer/runtime;
- que el workspace y SQLite son locales;
- que no deben utilizarse credenciales externas para probar la aplicación.

## Gate posterior a certificación

Después de que Microsoft certifique y publique/firme el paquete:

1. instalar PTL desde Microsoft Store en una máquina con Smart App Control activo;
2. comprobar que SAC no bloquea el binario Store-signed;
3. comprobar splash/startup;
4. comprobar listener `127.0.0.1`;
5. comprobar perfil/workspace;
6. comprobar continuidad del SQLite histórico donde corresponda;
7. comprobar actualización Store posterior con una versión superior.

Ese gate, no el sideload self-signed, es la validación definitiva de confianza pública bajo Smart App Control.
