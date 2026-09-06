# Backlog — Desktop lifecycle y distribución

Estado general: `IN_PROGRESS`

Este backlog continúa el cierre del slice desktop de Personal Tax Ledger después de haber validado arquitectura, packaging Windows x64, instalación, persistencia básica y reproducibilidad del instalador. El objetivo de esta fase es demostrar el comportamiento del producto durante su lifecycle real como aplicación instalada y dejar una base segura para UAT no técnico y futuras plataformas.

## Orden de ejecución

1. Single-instance explícito. ✅ DONE
2. Reinstalación de la misma versión. ⏭️ NEXT
3. Desinstalación + reinstalación con continuidad de datos.
4. Upgrade real entre versiones, inicialmente `0.1.0 -> 0.1.1` o equivalente según la versión canónica vigente al ejecutar el gate.
5. Backup / export / restore.
6. Migraciones formales de esquema y compatibilidad de datos.
7. Firma de código y experiencia SmartScreen.
8. UAT con usuario no técnico.
9. Distribución Linux nativa.
10. Canal de actualización posterior, si se adopta autoupdate o distribución administrada.

---

## PTL-DESKTOP-LC-001 — Single-instance explícito

Estado: `DONE`
Prioridad: `P0`
Tipo: gate funcional / lifecycle desktop
Plataforma: Windows x64
Cierre observado: `2026-09-06`

### Propósito

Verificar de forma explícita que una instalación de Personal Tax Ledger admite una única instancia de aplicación por sesión y que un segundo lanzamiento no crea un segundo runtime, una segunda ventana independiente ni una segunda instancia de acceso concurrente a la base local.

La implementación actual solicita un lock de instancia mediante Electron y escucha el evento `second-instance`. Si existe una ventana principal, el comportamiento esperado es restaurarla si está minimizada y llevarla al foco.

### Riesgo que controla

Sin este gate podrían coexistir dos procesos de aplicación con runtimes locales independientes apuntando a la misma persistencia, generando comportamiento confuso para el usuario y un riesgo innecesario de concurrencia sobre la base local.

### Precondiciones

- Personal Tax Ledger instalado mediante el instalador Windows vigente.
- La aplicación debe abrir correctamente en un lanzamiento normal.
- No se requiere modificar datos para este gate.

### Procedimiento manual

#### Caso A — segunda apertura con ventana visible

1. Abrir Personal Tax Ledger desde el acceso instalado.
2. Esperar a que la ventana principal termine de cargar.
3. Mantener la aplicación abierta.
4. Ejecutar nuevamente el mismo acceso de Personal Tax Ledger.
5. Observar el comportamiento durante algunos segundos.

Resultado esperado:

- no aparece una segunda ventana independiente;
- la instancia ya abierta continúa siendo la única ventana funcional;
- la aplicación existente recibe foco;
- no aparece un error visible.

Resultado observado: `PASS`.

#### Caso B — segunda apertura con ventana minimizada

1. Con Personal Tax Ledger abierto, minimizar la ventana.
2. Ejecutar nuevamente el acceso instalado.
3. Observar el comportamiento.

Resultado esperado:

- la ventana existente se restaura;
- la ventana recibe foco;
- no se crea una segunda ventana independiente.

Resultado observado: `PASS`.

### Criterios de aceptación

El gate queda `PASS` sólo si ambos casos cumplen:

- una única experiencia de aplicación visible;
- restauración desde minimizado al segundo lanzamiento;
- foco de la instancia existente;
- sin error de usuario;
- sin pérdida de funcionalidad después del segundo lanzamiento.

### Evidencia persistida

- Fecha: `2026-09-06`.
- Plataforma: Windows x64 nativo.
- Caso A — ventana visible: `PASS`.
- Caso B — ventana minimizada: `PASS`.
- Observación: no se reportaron errores ni segunda ventana visible.

### Condición de cierre

`DONE`: ambos casos fueron observados en Windows y la evidencia quedó persistida en la documentación canónica.

---

## PTL-DESKTOP-LC-002 — Reinstalación de la misma versión

Estado: `READY_TO_EXECUTE`
Prioridad: `P0`
Depende de: `PTL-DESKTOP-LC-001` ✅

### Propósito

Demostrar que ejecutar nuevamente el instalador de la misma versión sobre una instalación existente mantiene la aplicación operativa y conserva los datos del usuario.

### Procedimiento esperado

1. Crear un dato de prueba claramente identificable.
2. Cerrar PTL.
3. Ejecutar nuevamente el mismo `PersonalTaxLedger-Setup.exe`.
4. Completar la instalación.
5. Abrir PTL.
6. Confirmar que el dato persiste y que la aplicación funciona normalmente.

### Criterios de aceptación

- instalación completada sin corrupción;
- launch posterior correcto;
- dato previo presente;
- no duplicación evidente de datos;
- no pérdida de configuración relevante.

---

## PTL-DESKTOP-LC-003 — Desinstalación + reinstalación

Estado: `BACKLOG`
Prioridad: `P0`
Depende de: `PTL-DESKTOP-LC-002`

### Propósito

Confirmar que el lifecycle de desinstalación elimina la aplicación pero preserva los datos de usuario, y que una instalación posterior vuelve a encontrar esa información.

### Criterios de aceptación

- desinstalación completada;
- nueva instalación funcional;
- datos de usuario preservados;
- no se requiere recrear manualmente la base;
- no se observan residuos de aplicación que impidan reinstalar.

---

## PTL-DESKTOP-LC-004 — Upgrade real entre versiones

Estado: `BACKLOG`
Prioridad: `P0`
Depende de: `PTL-DESKTOP-LC-003`

### Propósito

Validar un upgrade real con cambio de versión del producto, inicialmente `0.1.0 -> 0.1.1` o el par equivalente vigente cuando se ejecute.

### Alcance mínimo del cambio de versión

La versión nueva debe ser funcionalmente equivalente o introducir un cambio pequeño y controlado; no debe mezclarse el gate de upgrade con una migración de gran alcance.

### Procedimiento esperado

1. Instalar versión N.
2. Registrar un dato identificable.
3. Cerrar PTL.
4. Generar instalador de versión N+1.
5. Instalar N+1 sobre N.
6. Abrir PTL.
7. Verificar versión, datos y funcionalidad principal.

### Criterios de aceptación

- upgrade completado;
- aplicación abre en N+1;
- datos N siguen disponibles;
- no se requiere desinstalar N previamente;
- accesos de aplicación siguen funcionando;
- la versión instalada corresponde a N+1.

---

## PTL-DATA-001 — Backup / export / restore

Estado: `BACKLOG`
Prioridad: `P1`

### Objetivo

Definir una capacidad explícita para respaldar, exportar y restaurar información del usuario sin depender de copiar manualmente archivos internos de la aplicación.

### Decisiones pendientes

- formato de backup;
- export funcional vs snapshot técnico;
- alcance de configuraciones incluidas;
- validación de integridad;
- compatibilidad entre versiones;
- UX de restauración y manejo de conflictos.

### Gate mínimo futuro

Crear información -> exportar/respaldar -> eliminar o usar instalación limpia -> restaurar -> verificar equivalencia funcional de datos.

---

## PTL-DATA-002 — Migraciones formales de esquema

Estado: `BACKLOG`
Prioridad: `P1`
Depende conceptualmente de: `PTL-DESKTOP-LC-004`

### Objetivo

Garantizar que cambios futuros en SQLite tengan una estrategia versionada, incremental, idempotente cuando corresponda y verificable mediante tests y upgrade de instalaciones reales.

### Criterios futuros

- versión de esquema identificable;
- migraciones ordenadas;
- backup o estrategia de recovery antes de cambios destructivos;
- test desde al menos una versión previa soportada;
- fallo explícito y recuperable ante migración incompleta.

---

## PTL-DIST-WIN-001 — Firma de código y SmartScreen

Estado: `BACKLOG`
Prioridad: `P1`

### Objetivo

Evaluar e implementar, cuando sea viable, firma de código para mejorar la confianza de instalación en Windows y reducir fricción asociada a aplicaciones no firmadas.

### Alcance

- estrategia de certificado;
- integración de firma con packaging;
- timestamping;
- firma de ejecutable/installer según corresponda;
- validación en Windows limpio;
- documentación de experiencia esperada de SmartScreen.

No bloquear UAT técnico actual por ausencia de firma, pero tratarlo como requisito antes de distribución más amplia.

---

## PTL-UAT-001 — UAT con usuario no técnico

Estado: `BACKLOG`
Prioridad: `P1`
Depende de: lifecycle Windows suficientemente cerrado

### Objetivo

Validar que una persona sin contexto de desarrollo pueda instalar, abrir, comprender el flujo básico y utilizar PTL sin asistencia técnica continua.

### Dimensiones a observar

- comprensión del instalador;
- descubrimiento de la aplicación después de instalar;
- onboarding;
- lenguaje funcional;
- registro de datos;
- recuperación ante error de ingreso;
- claridad de Resumen y Escenarios;
- cierre/reapertura;
- percepción de confianza;
- necesidades de ayuda contextual.

El UAT debe producir hallazgos de UX accionables, no sólo una calificación binaria.

---

## PTL-DIST-LINUX-001 — Distribución Linux nativa

Estado: `BACKLOG`
Prioridad: `P2`

### Objetivo

Extender la superficie desktop a Linux reutilizando la arquitectura y staging existentes, pero definiendo packaging e integración de escritorio nativos.

### Trabajo esperado

- seleccionar formatos de distribución iniciales;
- packaging Electron para Linux;
- iconografía y desktop entry;
- ubicación de datos bajo convenciones del sistema;
- instalación/desinstalación;
- single-instance;
- persistencia;
- upgrade o política de actualización;
- UAT nativo.

Linux se considera próximo target, no una capacidad actualmente validada.

---

## PTL-DIST-UPDATE-001 — Canal de actualización

Estado: `BACKLOG`
Prioridad: `P2`
Depende de: `PTL-DESKTOP-LC-004`

### Objetivo

Definir si PTL requiere autoupdate, actualización manual asistida o un canal administrado de releases. La decisión debe considerar simplicidad, confianza, reproducibilidad y operación real antes de incorporar infraestructura adicional.

---

## Secuencia de gates

```mermaid
flowchart TD
    A["LC-001 Single instance - DONE"] --> B["LC-002 Reinstalación misma versión - READY"]
    B --> C["LC-003 Uninstall + reinstall"]
    C --> D["LC-004 Upgrade real N a N+1"]
    D --> E["DATA-001 Backup / restore"]
    D --> F["DATA-002 Migraciones"]
    D --> G["DIST-WIN-001 Firma de código"]
    E --> H["UAT-001 Usuario no técnico"]
    F --> H
    G --> H
    H --> I["DIST-LINUX-001 Linux"]
    D --> J["DIST-UPDATE-001 Canal de actualización"]
```

## Definición de salida de esta fase

La fase desktop Windows puede considerarse suficientemente estabilizada para UAT no técnico cuando:

- single-instance esté observado; ✅
- reinstalación misma versión esté observada;
- uninstall/reinstall esté observado;
- al menos un upgrade real entre versiones esté observado;
- no existan pérdidas de datos conocidas asociadas al lifecycle;
- la evidencia esté persistida y sea reproducible.
