# Auditoría rápida A6-A18: contrato versus realidad

## Alcance

Comparación de los resultados esperados documentados en `docs/architecture/migration-sequence.md`, `docs/architecture/target-package-map.md`, los packs A14-A18, la auditoría histórica de A6-A13 y el código/evidencia actual. Esta revisión solo detecta diferencias; no corrige implementación.

## Resultado alineado

- A6: existe host HTTP real en `apps/local`; el root `server/` fue eliminado.
- A7: SQLite está encapsulado en `sqlite-adapter`, con factory, lifecycle y repositorios por agregado.
- A8: existen DTOs compartidos para los agregados principales, errores y paginación.
- A9-A10: shell React modular, `shared-ui` compilado y render tests reales.
- A11-A13: tests por workspace, consumer externo, TypeScript estricto, CI, runtime smoke y estrategia Windows documentada.
- A14: ADR, mapa, reglas de dependencia, ciclos y checks negativos existen.
- A15: routers HTTP viven en `http-api` y no hay root `server/`.
- A16: core/contracts/application están organizados por slices y el inner hexagon se ejecuta con fakes.
- A17: existe `frontend-application`, coordinación extraída, frontend local bajo `apps/local/web` y certificación host/reuse.
- A18: consumer externo instala tarballs, ejecuta `http-api`, application, frontend services y shared UI sin roots locales.

## Gaps detectados

### 1. Servicios frontend incompletos frente al mapa objetivo

**Tipo**: técnico  
**Descripción**: `docs/architecture/target-package-map.md` asigna a `frontend-application` servicios para tax parameters, snapshots, years, referencias y bootstrap. La API pública actual solo exporta factories para incomes, fees, mortgages, scenarios, sources, logs y settings. `listTaxParameters`, `updateTaxParameters`, `saveSnapshot`, `listYears`, referencias y bootstrap siguen en el cliente local o en glue del host.  
**Impacto**: un host cloud que necesite esas features todavía debe copiar/adaptar parte de la coordinación local. El veredicto `READY` cubre la superficie certificada, no la matriz completa de features del mapa objetivo.  
**Acción requerida**: decidir si esos servicios forman parte de A18 o si se difieren; si forman parte, extraerlos a `frontend-application` y añadir smoke externo.  
**Prioridad**: media

### 2. Coordinación global de features aún permanece en el host

**Tipo**: técnico  
**Descripción**: A17.3 extrajo coordinación pura de fees, mortgages, scenarios y sources, pero `apps/local/web/src/app/WorkspaceView.tsx` conserva el estado y coordinación transversal de bootstrap, cambio de año, simulación, APV, settings, tax parameters, cargas de mortgages/annual records y refrescos. `features/settings/SettingsModule.tsx` sigue siendo un reexport del `App` local.  
**Impacto**: la separación frontend host/reuse es parcial para settings, APV, dashboard y coordinación transversal; otro host no puede ensamblar esas partes sin reproducir lógica de `WorkspaceView`.  
**Acción requerida**: definir el límite de coordinación que debe ser reusable y extraer hooks/controllers de las features restantes, o actualizar el mapa objetivo para declarar explícitamente esta coordinación como local.  
**Prioridad**: media

### 3. Suites contractuales reutilizables cubren principalmente ingresos

**Tipo**: técnico  
**Descripción**: `packages/contracts/src/testing.mjs` exporta `incomeSourceRepositoryContract`, pero los repositorios de fees, mortgages, settings, logs, tax catalogs, snapshots, years y referencias se verifican con tests específicos del adapter, no con suites contractuales reutilizables equivalentes.  
**Impacto**: un adapter cloud futuro no tiene una suite común para demostrar compatibilidad conductual de todos los agregados; puede cumplir firmas sin validar aislamiento, errores, actualización, eliminación o idempotencia de cada contrato.  
**Acción requerida**: crear y exportar suites contractuales por agregado, o documentar formalmente por qué algunos contratos no requieren una suite reusable.  
**Prioridad**: media

### 4. Cobertura HTTP de CRUD especializado sigue incompleta

**Tipo**: técnico  
**Descripción**: `test/http-contract.test.mjs` cubre health, simulate, incomes, fee calculation, article 55 bis y scenarios, pero no ejercita por HTTP el CRUD completo de `/api/fee-receipts` ni `/api/mortgages`. La cobertura actual está en tests de módulos/adapters y simulación integrada.  
**Impacto**: cambios de wiring HTTP, payloads o status codes de boletas y mortgages podrían romperse sin una caracterización end-to-end equivalente a ingresos.  
**Acción requerida**: agregar pruebas HTTP de CRUD, duplicación/gastos de boletas, mortgages y annual records.  
**Prioridad**: media

### 5. `local-app` reporta cero tests propios en workspace

**Tipo**: técnico  
**Descripción**: `npm run test:workspaces` ejecuta `node --test` dentro de `@personal-tax-ledger/local-app` y reporta `0 tests`; el lifecycle, composición y runtime se cubren desde `test/` raíz.  
**Impacto**: el gate de workspace no garantiza cobertura local dentro del propio package y puede dar una señal incompleta si los tests raíz dejan de ejecutarse.  
**Acción requerida**: decidir si se agregan tests bajo `apps/local/test` o si la política acepta explícitamente cobertura raíz para hosts.  
**Prioridad**: baja

### 6. Evidencia Windows no fue ejecutada en esta sesión

**Tipo**: prerrequisito  
**Descripción**: el workflow contiene matriz `windows-latest` y existen helpers para `npm.cmd`/paths portables, pero la batería ejecutada durante esta auditoría se corrió en Linux. No hubo ejecución real de GitHub Actions Windows disponible en esta sesión.  
**Impacto**: la portabilidad Windows está configurada y testeada por equivalentes, pero no queda evidencia runtime Windows en esta ejecución local.  
**Acción requerida**: ejecutar y conservar el resultado del job Windows de CI antes de usar la certificación como evidencia multiplataforma definitiva.  
**Prioridad**: baja

### 7. Documentación histórica conserva estados y rutas obsoletas

**Tipo**: técnico  
**Descripción**: `docs/architecture/pack-a-final-report.md`, `docs/gaps/migration-fails.md`, ADR históricos y algunos documentos de migración todavía mencionan `server/routes`, root `web`, fachadas existentes o estados `PACK_A_PARTIAL`, aunque el estado actual A14-A18 los supera.  
**Impacto**: una lectura rápida puede mezclar deuda histórica ya resuelta con gaps abiertos actuales y producir conclusiones contradictorias sobre readiness.  
**Acción requerida**: marcar documentos como históricos/superseded o añadir referencias cruzadas al informe final A18 sin borrar trazabilidad.  
**Prioridad**: baja

## Conclusión

La implementación actual cumple la columna vertebral Clean/Hexagonal y la evidencia de consumo externo definida en A18. Sin embargo, la afirmación es más fuerte para las superficies certificadas que para la matriz completa de features del mapa objetivo. Los gaps 1-4 son las diferencias técnicas principales entre lo que el mapa/patrón sugiere para una reutilización completa y lo que realmente está certificado.
