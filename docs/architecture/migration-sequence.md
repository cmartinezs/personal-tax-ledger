# Secuencia de migración

| Iteración | Cambio | Dependencias | Riesgo principal | Rollback |
|---|---|---|---|---|
| A00 | Documentar estado y fronteras | Ninguna | Mapa incompleto | Revertir documentación. |
| A01 | Tests de caracterización y contratos HTTP | Estado actual estable | Fixtures que congelen un bug | Revertir solo tests; separar incidencias. |
| A02 | Workspaces y esqueletos de paquetes | A00, A01 | Resolución npm y scripts | Retirar packages del workspace; conservar server/web. |
| A03 | Extraer cálculos puros a `core` | A02 | Diferencias de redondeo/imports | Reexports desde `server/lib`; restaurar adaptador. |
| A04 | Compartir DTOs y migrar un endpoint | A02 | Divergencia de serialización | Mantener DTO local y desactivar adaptador vertical. |
| A05 | Definir contratos y contexto | A02, A03 | Puerto demasiado genérico | Mantener contrato para un solo agregado. |
| A06 | Implementar primer adaptador SQLite | A05 | Cambios de transacción o migración | Envolver las funciones actuales sin mover SQL. |
| A07 | Extraer un caso de uso vertical | A03, A05, A06 | Lógica duplicada en router | Restaurar llamada directa al módulo existente. |
| A08 | Modularizar HTTP por rutas | A04, A07 | Pérdida accidental de endpoints | Comparar rutas y conservar router anterior como fachada. |
| A09 | Extraer cliente y una sección React | A04 | Regresión de estado/navegación | Revertir solo la sección extraída. |
| A10 | Crear `shared-ui` con una sección | A03, A04, A09 | UI acoplada al transporte | Mantener componente en web hasta abstraer servicios. |
| A11 | Composition root y `apps/local` | A06-A10 | Ruta de SQLite y arranque | Mantener scripts raíz y paths anteriores. |
| A12 | Exports, versionado y empaquetado | A03-A10 | API pública prematura | No publicar; corregir exports y changelog. |
| A13 | CI y límites arquitectónicos | A01-A12 | Checks frágiles o lentos | Ejecutar checks informativos antes de hacerlos bloqueantes. |

Cada iteración debe producir un cambio pequeño, ejecutar `npm test`, `npm run build` y las verificaciones específicas de la frontera modificada.
