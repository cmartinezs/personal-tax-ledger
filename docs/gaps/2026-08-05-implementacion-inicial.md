# Gaps — Implementación inicial (boletas de honorarios, art. 55 bis, escenarios)

Fecha: 2026-08-05
Sesión: adición de módulos de boletas de honorarios, crédito hipotecario
art. 55 bis y sección de comparación de escenarios.

---

## 1. Verificación legal de las reglas tributarias (funcional — prioridad alta)

**Descripción**: Las fórmulas y umbrales del art. 55 bis (90/150 UTA, cap
de 8 UTA, porcentaje `250 − 1.667 × renta_uta`) y de boletas de honorarios
(tasa de retención 15.25 %, gasto presunto 30 % con tope 15 UTA) están
implementadas según conocimiento general, pero no se validaron contra el
texto oficial vigente. El proyecto tiene la restricción de usar fuentes
oficiales (SII, BCN, Superintendencia de Pensiones, Fonasa) y no hacer
scraping en runtime, así que la validación queda como tarea manual/de
documentación.

**Impacto**: Los valores simulados podrían no coincidir con la normativa
2026. Los parámetros están versionados en `tax_parameters`, por lo que el
error sería de datos semilla, no de estructura.

**Acción requerida**: Revisar con un profesional tributario o con el texto
publicado de la Ley sobre Impuesto a la Renta (art. 55 bis) y la Ley 18.768
(boletas de honorarios) para el año 2026, y ajustar `TAX_PARAMETER_SEEDS`
en `server/lib/tax-parameters.mjs`.

---

## 2. Valor de la UTA 2026 (funcional/prerrequisito — prioridad alta)

**Descripción**: Todos los cálculos de honorarios y crédito hipotecario
dependen del valor en pesos de la UTA del año en curso. No se definió de
dónde ni cómo se actualiza (tabla `tax_parameters` semilla vs. ingreso por
UI vs. servicio externo).

**Impacto**: Si el valor de UTA está desactualizado o ausente, los umbrales
en pesos y los topes (15/8 UTA) se calculan mal.

**Acción requerida**: Decidir el mecanismo de actualización anual del valor
de UTA (campo editable en UI y/o proceso de carga) y garantizar la semilla
2026 con el valor publicado por el SII.

---

## 3. Interacción con PPM (Pagos Provisionales Mensuales) (funcional — prioridad media)

**Descripción**: El motor calcula retención y gasto presunto de boletas,
pero no modela la interacción completa con los PPM (crédito por retenciones,
reajustes, imputación al impuesto de primera categoría, etc.). El formulario
ofrece selección de modo de reconocimiento (`feeRecognitionMode`) y de
honorarios (`honorariosExpenseMethod`), pero no se validó funcionalmente que
esos modos representen correctamente las opciones reales del declarante.

**Impacto**: La conciliación anual puede diferir de la declaración real de
un contribuyente que además es emprendedor con PPM.

**Acción requerida**: Definir con un experto tributario qué modos son
correctos, o documentar que el simulador asume un caso simplificado.

---

## 4. Requisito de "vivienda habitación" para art. 55 bis (funcional — prioridad media)

**Descripción**: El art. 55 bis requiere que el crédito hipotecario sea para
la adquisición o construcción de la vivienda habitación del contribuyente.
El modelo de datos no contempla este atributo por préstamo (no se valida que
el destino del préstamo sea vivienda propia).

**Impacto**: Un préstamo para segunda vivienda u otro destino podría ser
admitido en el beneficio cuando legalmente no corresponde.

**Acción requerida**: Confirmar el requisito y agregar el atributo
`destino_vivienda` / validación en `server/lib/mortgages.mjs` y el modelo de
datos.

---

## 5. Errores de tipos TypeScript preexistentes (técnico — prioridad media)

**Descripción**: `npx tsc -b` reporta errores preexistentes no relacionados
con el trabajo de esta sesión: tipado de `Settings` en `web/src/App.tsx`,
`import './styles.css'` y `tsconfig.node.json` con `allowImportingTsExtensions`.

**Impacto**: No se puede afirmar que el frontend esté libre de errores de
tipos; el build de Vite pasa, pero el chequeo estático de TS falla.

**Acción requerida**: Ticket dedicado para limpiar esos errores (ajustar
tipos de `Settings`, configuración de CSS en Vite y tsconfig).

---

## 6. Estrategia de migraciones de base de datos (prerrequisito — prioridad media)

**Descripción**: El esquema se crea con `CREATE TABLE IF NOT EXISTS` y
semillas idempotentes en `server/lib/database.mjs`. No existe un runner de
migraciones versionado, por lo que cambios de esquema futuros no son
auditables ni reproducibles.

**Impacto**: En producción, evolucionar el esquema puede requerir migración
manual; riesgo de inconsistencias entre entornos.

**Acción requerida**: Introducir un mecanismo de migraciones (p. ej. tabla
`schema_migrations` con scripts por versión) o documentar explícitamente que
el esquema se gestiona a mano.

---

## 7. Sin tests de frontend (técnico — prioridad media)

**Descripción**: Los tests cubren solo el backend (`node --test` sobre
`server/test/*.test.mjs`, 29 tests). No hay tests de componentes React ni
end-to-end del flujo de UI.

**Impacto**: Los cambios de UI pueden romper el flujo sin detección
automática.

**Acción requerida**: Agregar un framework de testing del frontend
(Vitest + Testing Library) y casos mínimos por módulo.

---

## 8. Autenticación/autorización (prerrequisito — prioridad baja)

**Descripción**: La API es abierta, sin sesiones ni control de acceso.
`server/index.mjs` expone operaciones de escritura (CRUD, parámetros) sin
protección.

**Impacto**: Cualquiera que alcance el endpoint puede modificar datos.

**Acción requerida**: Definir si la herramienta es de uso local/single-user
(documentar) o agregar auth (p. ej. token de entorno) antes de exponerla.

---

## 9. Servir el frontend en producción (técnico/prerrequisito — prioridad baja)

**Descripción**: En dev, Vite (5173) proxya `/api` al servidor (3001). En
producción no hay configuración para que el servidor API sirva el build de
`web/` ni para el proxy de API.

**Impacto**: El despliegue actual requiere correr dos procesos y un proxy.

**Acción requerida**: Configurar el servidor para servir `web/dist` como
estáticos y/o documentar el deploy.

---

## 10. Gestión de snapshots sin UI (técnico — prioridad baja)

**Descripción**: Existe endpoint `POST /api/snapshots` para guardar
simulaciones, pero no hay vista en `web/` para listar, ver o cargar
snapshots guardados.

**Impacto**: La funcionalidad de snapshots existe en API pero no es
utilizable por el usuario.

**Acción requerida**: Agregar UI de snapshots o retirar el endpoint.

---

## 11. Internacionalización (prerrequisito — prioridad baja)

**Descripción**: Todo el texto de la UI está hardcodeado en español y los
formatos monetarios usan convención local fija.

**Impacto**: No es problema si el alcance es Chile en español; limita si se
quiere multilingüe.

**Acción requerida**: Decisión de alcance; si se quiere i18n, introducir
libería/tablas de traducciones.

---

## 12. Versionado de `node:sqlite` (técnico — prioridad baja)

**Descripción**: El proyecto usa `node:sqlite` (módulo nativo experimental),
que requiere Node >= 22.5. Se asume Node 24 LTS, pero no hay verificación en
el arranque.

**Impacto**: Falla críptica al arrancar con Node antiguo.

**Acción requerida**: Documentar en README el requisito de Node y/o agregar
chequeo de versión al arrancar el servidor.
