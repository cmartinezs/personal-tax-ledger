# Instrucciones del agente

Este archivo contiene las reglas que el agente (opencode) debe seguir en
este repositorio. Aplica a todas las tareas.

## Stack y convenciones

- Monorepo: `server/` (Node.js ESM, `.mjs`) y `web/` (React 19 + TypeScript
  strict + Vite).
- Base de datos: `node:sqlite` sin ORM. Entidades con datos variables como
  JSON TEXT.
- Parámetros tributarios versionados por año en `tax_parameters`; fuentes
  oficiales en `tax_rule_sources`.
- Fuentes de normativa: solo oficiales (SII, BCN, Superintendencia de
  Pensiones, Fonasa). Sin scraping en runtime.
- Cálculos en módulos puros (`server/lib/*-calculator.mjs`); la capa de
  persistencia va en repos/repos de `server/lib/*.mjs`; el router vive en
  `server/index.mjs`.
- Errores de validación: lanzar `ValidationError` (de
  `server/lib/util.mjs`) y mapearlos a HTTP 400 con `fieldErrors`.
- Redondeo monetario: `round2` de `server/lib/util.mjs`.
- Los archivos nuevos del servidor deben exportar las funciones exactas que
  importa `server/index.mjs`.
- NO agregar comentarios al código salvo que se pidan.
- NO arreglar errores preexistentes de `tsc -b` durante trabajo de
  features; documentarlos como gap (ver abajo).

## Verificación obligatoria tras una tarea

- `npm test` (backend: `node --test server/test/*.test.mjs`).
- `cd web && npx --no-install vite build`.
- Si el cambio toca la API: verificar con curl contra el servidor en `:3001`.

## REGLA: documentar gaps en `docs/gaps/`

Al final de cada acción principal (es decir, cuando concluya una tarea
sustantiva — implementar un feature, investigar, refactorizar), el agente
DEBE revisar si durante esa acción encontró algo que no pudo hacer, por
cualquiera de estas razones:

1. **Desconocimiento funcional**: no sabe cómo debe comportarse el negocio
   (normativa tributaria, reglas de producto sin definir).
2. **Desconocimiento técnico**: no sabe cómo implementar algo con el stack
   actual.
3. **Prerrequisito faltante**: falta una dependencia, decisión de producto,
   dato semilla, información o acceso para poder avanzar.

Por cada hallazgo, el agente DEBE escribir (o actualizar) un documento en
`docs/gaps/` con el formato:

- Archivo: `YYYY-MM-DD-tema.md` (un archivo por tema o por sesión).
- Contenido por gap: **Tipo** (`funcional` / `técnico` / `prerrequisito`),
  **Descripción**, **Impacto**, **Acción requerida** y **Prioridad**
  (`alta` / `media` / `baja`).
- Actualizar el índice de `docs/gaps/README.md`.

Si no hay gaps nuevos, no es necesario escribir archivos adicionales.

El objetivo es que los gaps queden priorizados y sirvan de hoja de ruta
para sesiones futuras (qué agregar primero).

## Compromisos

- Nunca adivinar valores normativos: si una cifra (tasa, UTA, umbral) no
  está verificada, registrarlo como gap de prioridad alta en lugar de
  inventarla silenciosamente.
