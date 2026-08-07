# Arquitectura

Documentación técnica para entender límites, dependencias y flujos del monorepo.

## Lectura recomendada

1. [`adr/0001-clean-hexagonal-architecture.md`](adr/0001-clean-hexagonal-architecture.md): decisión arquitectónica Clean/Hexagonal (objetivo).
2. [`target-package-map.md`](target-package-map.md): mapa objetivo de packages y vertical slices.
3. [`architecture-guardrails.md`](architecture-guardrails.md): guardrails automatizados y excepciones transitorias.
4. [`current-state.md`](current-state.md): qué existe hoy y cómo se conecta.
5. [`target-state.md`](target-state.md): principios y límites que deben conservarse.
6. [`module-destination-map.md`](module-destination-map.md): ubicación de cada responsabilidad.
7. [`package-policy.md`](package-policy.md): superficie pública de paquetes.
8. [`http-route-catalog.md`](http-route-catalog.md): contrato operativo de endpoints.
9. [`migration-sequence.md`](migration-sequence.md): contexto histórico de la migración.
10. [`aggregate-migration-pattern.md`](aggregate-migration-pattern.md): procedimiento para migrar un agregado.

## Verificaciones

```bash
npm run architecture:check
npm run build:packages
npm run typecheck
```

El checker de arquitectura inspecciona imports de `packages/*` y `apps/*`, detecta ciclos y protege las fronteras de `core`/`contracts`.
