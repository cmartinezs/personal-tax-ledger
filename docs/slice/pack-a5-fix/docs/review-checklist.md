# Checklist de revisión — pack-a5-fix

Aplica esta checklist a **cada PR** de este paquete antes de fusionar.

## Alcance y proceso

- [ ] El PR corresponde a un solo prompt de `prompts/`, sin mezclar
      objetivos de otras iteraciones.
- [ ] El PR es pequeño y revisable (si no lo es, ¿se documentó
      explícitamente qué quedó para un PR siguiente?).
- [ ] Se actualizó `docs/acceptance-matrix.md` con el estado real (no
      "asumido") de los criterios que este PR dice resolver.
- [ ] Si corresponde, se actualizó `docs/migration-checklist.md`.

## Verificación técnica

- [ ] `npm test` pasa sin regresiones (comparar cantidad de tests contra
      la corrida anterior; una reducción inexplicada es una señal de
      alerta).
- [ ] `npm run architecture:check` pasa.
- [ ] Si el PR toca `web/`: `npx --no-install vite build` pasa desde
      `web/`.
- [ ] Si el PR toca `packages/shared-ui`: existe un build reproducible
      (`dist/`) y el `package.json` del paquete apunta a él.
- [ ] Si el PR toca contratos de persistencia: los métodos afectados son
      `async` de punta a punta (contrato, adaptador, caso de uso, router,
      tests).
- [ ] Si el PR toca la API HTTP: se verificó con `curl` contra el
      servidor real levantado con un `DB_PATH` temporal.
- [ ] Ningún test nuevo es una simple verificación de texto (`grep`)
      donde sea razonable ejercitar el comportamiento real (llamar la
      función, renderizar el componente, hacer la petición HTTP).

## Fronteras arquitectónicas

- [ ] `packages/core` y `packages/contracts` siguen sin depender de
      ningún otro paquete interno ni de Node HTTP, React, SQLite,
      Supabase o Firebase.
- [ ] Ningún paquete importa `@personal-tax-ledger/*` de forma que genere
      un ciclo (verificado por `architecture:check`, no solo a ojo).
- [ ] Ningún módulo de infraestructura (`sqlite-adapter`, `application`,
      `local-app`) ejecuta I/O real (abrir la base, crear directorios) al
      ser *importado*; los efectos ocurren solo al invocar una factory
      explícita.

## Cierre

- [ ] El resumen final del PR indica: archivos relevantes, decisiones
      tomadas, pruebas ejecutadas, resultado, riesgos y la siguiente
      iteración recomendada (según el orden en `README.md`).
- [ ] Si se descubrió un gap nuevo (funcional, técnico o de
      prerrequisito), se documentó en `docs/gaps/` siguiendo la
      convención del proyecto (`Tipo`, `Descripción`, `Impacto`, `Acción
      requerida`, `Prioridad`).
