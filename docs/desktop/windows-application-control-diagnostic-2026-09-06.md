# Windows Application Control diagnostic — 2026-09-06

Estado: `BLOCKER_CONFIRMED`
Afecta a: `PTL-DIST-WIN-001`
Versión observada: `0.1.4`

## Resumen

La instalación de `PersonalTaxLedger-0.1.4-Setup.exe` alcanzó a materializar la aplicación bajo `app-0.1.4`, pero el hook post-install de Squirrel no pudo ejecutar `PersonalTaxLedger.exe` porque Windows Application Control lo bloqueó.

La causa observada no es un fallo de extracción, Squirrel, workspace ni persistencia. El ejecutable instalado está sin firma Authenticode y el equipo tiene Smart App Control / Code Integrity en modo de enforcement.

## Evidencia observada

El diagnóstico de Windows reportó:

- `CodeIntegrityPolicyEnforcementStatus = 2`;
- `UsermodeCodeIntegrityPolicyEnforcementStatus = 2`;
- `VerifiedAndReputablePolicyState = 1`;
- políticas activas bajo `CodeIntegrity/CiPolicies/Active`;
- eventos `Microsoft-Windows-CodeIntegrity` 3033 y 3077 contra `app-0.1.4/PersonalTaxLedger.exe`;
- eventos 3118 identificados como `Smart App Control Block Details`;
- policy ID observada: `{0283AC0F-FFF1-49AE-ADA1-8A933130CAD6}` (`VerifiedAndReputableDesktop`);
- `PersonalTaxLedger.exe`: `Authenticode Status = NotSigned`;
- `Update.exe`: `Authenticode Status = NotSigned`;
- no se observó `Zone.Identifier` en los ejecutables ya instalados, por lo que el bloqueo no depende de Mark-of-the-Web en esos archivos.

## Diagnóstico

Smart App Control está aplicando una política Verified and Reputable sobre código de usuario. El ejecutable PTL 0.1.4 no satisface el nivel de firma requerido y es rechazado durante el hook Squirrel.

Esto explica la secuencia:

```text
Setup.exe
  -> Squirrel extrae app-0.1.4
  -> registra executable stub
  -> intenta ejecutar PersonalTaxLedger.exe --squirrel-*
  -> Code Integrity / Smart App Control bloquea el EXE
  -> hook post-install falla
  -> Setup termina con error
```

## Implicancia de prioridad

`PTL-DIST-WIN-001 — Firma de código / SmartScreen` deja de ser un polish de distribución P1 y pasa a ser un **blocker P0 para continuar UAT Windows en un equipo con Smart App Control enforced**.

No corresponde degradar el producto intentando evitar el hook Squirrel: aunque el instalador ocultara ese error, el mismo ejecutable seguiría sujeto a la política al lanzarse.

## Estrategia recomendada

### Producción

Usar firma Authenticode con certificado RSA emitido por un proveedor reconocido por el Microsoft Trusted Root Program, o un servicio de firma equivalente compatible con Smart App Control.

La pipeline de distribución debe terminar firmando y verificando, como mínimo:

1. ejecutable real de PTL dentro del paquete;
2. bootstrap/stub o binarios adicionales propios cuando corresponda;
3. instalador final;
4. timestamp de firma;
5. verificación Authenticode antes de publicar.

### Desarrollo / UAT

Un certificado autofirmado puede servir para escenarios controlados donde la confianza se administra explícitamente, pero no debe asumirse como solución para Smart App Control público. El gate de producción exige una identidad de firma confiable.

## Gate de cierre futuro

`PTL-DIST-WIN-001` podrá cerrarse sólo cuando:

- el build soporte firma reproducible/configurable sin secretos en el repo;
- `Get-AuthenticodeSignature` devuelva `Valid` para los binarios que deban firmarse;
- un instalador firmado complete instalación/upgrade en Windows con Smart App Control activo;
- PTL ejecute el hook Squirrel y abra normalmente;
- el workspace y datos existentes permanezcan intactos;
- el splash post-upgrade y los gates de startup pendientes puedan retomarse.

## Datos preservados durante el fallo

La evidencia mostró que permanecen separados del directorio de instalación:

```text
%APPDATA%/Personal Tax Ledger/bootstrap.json
%APPDATA%/Personal Tax Ledger/data/personal-tax-ledger.sqlite
```

Por lo tanto, el fallo 0.1.4 observado no constituye evidencia de pérdida de datos personales.
