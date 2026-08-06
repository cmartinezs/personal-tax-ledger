# Paquete A — migración incremental del repositorio público

## Estado final buscado

El repositorio público seguirá siendo una aplicación local completa y open source, pero contendrá paquetes reutilizables:

```text
personal-tax-ledger/
├── apps/
│   └── local/
├── packages/
│   ├── core/
│   ├── contracts/
│   ├── api-contracts/
│   ├── shared-ui/
│   └── sqlite-adapter/
└── package.json
```

Esta es una dirección, no una orden para mover todo de una vez. Durante varias iteraciones puede existir una estructura transitoria.

## A00 — Descubrimiento y mapa de dependencias

```text
Objetivo: analizar el repositorio actual y producir un plan de migración basado en evidencia, sin modificar código productivo.

Inspecciona especialmente:

- server/index.mjs y sus responsabilidades;
- server/lib, identificando cálculo puro, persistencia, configuración y validación;
- web/src/App.tsx, cliente HTTP, tipos y componentes;
- esquema y migraciones SQLite;
- tests actuales y zonas sin cobertura;
- imports que cruzan las fronteras propuestas.

Entrega dentro de docs/architecture:

1. current-state.md con el mapa actual;
2. target-state.md con las fronteras core, contracts, api-contracts, shared-ui, sqlite-adapter y local app;
3. migration-sequence.md con pasos pequeños, dependencias, riesgos y rollback;
4. una tabla que asigne cada módulo actual a su destino tentativo.

No muevas archivos, no cambies imports y no agregues dependencias de runtime. Solo documentación respaldada por el código real.
```

## A01 — Red de seguridad y tests de caracterización

```text
Objetivo: aumentar la seguridad de la refactorización sin cambiar la arquitectura todavía.

Agrega tests de caracterización para las funciones tributarias públicas y los principales endpoints usados por el frontend. Prioriza:

- simulación anual;
- APV A/B y APV por planilla;
- boletas y gastos;
- artículo 55 bis;
- escenarios;
- persistencia SQLite esencial.

Usa fixtures pequeños, ficticios y deterministas. Congela fecha/reloj cuando corresponda. No reescribas el motor ni corrijas bugs no relacionados: si aparece uno, documéntalo con un test marcado o una incidencia separada.

El resultado debe demostrar que los cambios estructurales posteriores pueden detectar regresiones de resultados, redondeos y contratos HTTP.
```

## A02 — Preparar workspaces sin mover la aplicación

```text
Objetivo: preparar el repositorio para paquetes internos sin reubicar todavía server/ ni web/.

Configura workspaces para packages/* además del workspace web existente. Crea esqueletos mínimos y privados para:

- @personal-tax-ledger/core
- @personal-tax-ledger/contracts
- @personal-tax-ledger/api-contracts

Cada paquete debe tener exports explícitos, scripts mínimos coherentes con el stack y una política clara de dependencias. Todavía no extraigas lógica productiva.

Agrega un test o chequeo de arquitectura que impida que core importe Node HTTP, React, SQLite, Supabase o Firebase.

Conserva npm install, npm run dev, npm test, npm run build y npm start desde la raíz con el mismo comportamiento.
```

## A03 — Extraer primero los cálculos puros

```text
Objetivo: mover a @personal-tax-ledger/core únicamente los módulos de cálculo que ya sean puros o puedan volverse puros con un cambio pequeño.

Incluye, por porciones seguras:

- cálculo tributario principal;
- boletas de honorarios;
- artículo 55 bis;
- parámetros y valores por defecto estrictamente necesarios para calcular;
- utilidades matemáticas y validaciones de dominio sin I/O.

No muevas persistencia, HTTP, lectura de variables de entorno ni lógica React. Preserva las firmas públicas mediante reexports o adaptadores transitorios para evitar un cambio disruptivo.

Los tests existentes deben ejecutar el código ya extraído. Agrega tests de pureza y dependencias. Documenta qué módulos permanecen temporalmente en server/lib y por qué.
```

## A04 — Tipos y contratos de API compartidos

```text
Objetivo: eliminar la duplicación y ambigüedad entre payloads del frontend y respuestas del servidor.

Extrae a @personal-tax-ledger/api-contracts:

- DTOs de request y response;
- ApiError y códigos de error;
- filtros, paginación y resultados de simulación;
- esquemas de validación solo si ya existe una solución compatible o puede agregarse sin acoplar core.

No coloques entidades con comportamiento de dominio dentro de api-contracts. No hagas que core dependa de DTOs HTTP.

Migra un conjunto vertical pequeño de endpoints primero, por ejemplo ingresos o boletas. Usa adaptadores de mapeo explícitos. Agrega contract tests que comprueben que cliente y servidor comparten la misma forma serializada.
```

## A05 — Contratos de repositorios y contexto de propietario

```text
Objetivo: definir puertos de persistencia sin reemplazar SQLite todavía.

En @personal-tax-ledger/contracts define interfaces por agregado, no una interfaz genérica gigante. Incluye un OwnerContext o WorkspaceContext obligatorio en los casos de uso que operen datos privados.

Decisión normativa:

- local usa workspaceId = "local-workspace" y actorId = "local-user";
- cloud podrá usar identificadores reales;
- las entidades hijas se asocian mediante su agregado raíz; no se exige user_id en cada tabla;
- catálogos tributarios globales no llevan propietario.

Define contratos inicialmente para un agregado pequeño. No modifiques todavía todas las tablas ni agregues columnas innecesarias a SQLite. Incluye contract tests reutilizables que una implementación de repositorio deba satisfacer.
```

## A06 — Encapsular SQLite detrás de adaptadores

```text
Objetivo: hacer que el código de aplicación deje de importar funciones SQLite concretas para el agregado elegido en A05.

Crea @personal-tax-ledger/sqlite-adapter e implementa los contratos definidos. Puedes envolver temporalmente las funciones existentes antes de mover físicamente todo el SQL.

Requisitos:

- mismas transacciones y comportamiento;
- migraciones idempotentes;
- misma ubicación y compatibilidad de la base local;
- contract tests ejecutados contra una base temporal real;
- ninguna dependencia desde core hacia SQLite;
- no convertir toda la persistencia en una sola iteración.

Después de validar el primer agregado, documenta el patrón para migrar los restantes uno por uno.
```

## A07 — Capa de aplicación y casos de uso

```text
Objetivo: sacar de server/index.mjs una primera funcionalidad vertical completa.

Crea casos de uso que coordinen core y contratos para el agregado ya encapsulado. El caso de uso recibe WorkspaceContext y dependencias por constructor o factory; no conoce HTTP ni SQLite.

La ruta HTTP debe limitarse a:

1. autenticar/resolver el contexto local;
2. parsear y validar transporte;
3. invocar el caso de uso;
4. mapear el resultado o error a HTTP.

Mantén las URLs y respuestas actuales. Agrega unit tests del caso de uso y tests de integración de la ruta. No migres todas las rutas en este PR.
```

## A08 — Modularizar el servidor HTTP

```text
Objetivo: reducir server/index.mjs sin cambiar el servidor HTTP nativo ni sus endpoints.

Extrae progresivamente:

- infraestructura HTTP común;
- routing por módulo;
- validación de transporte;
- mapeo de errores;
- servicio de archivos estáticos;
- composition root local.

No introduzcas Express, Fastify ni otro framework en esta iteración. Cada router debe depender de casos de uso o servicios, no de SQLite directamente.

Migra uno o dos módulos por PR. Mantén tests de endpoint y una comparación de rutas antes/después para evitar pérdidas accidentales.
```

## A09 — Cliente frontend y separación progresiva de App.tsx

```text
Objetivo: desacoplar React del transporte y reducir App.tsx gradualmente.

Primero crea:

- un ApiClient tipado que use @personal-tax-ledger/api-contracts;
- servicios frontend por módulo;
- componentes/páginas para una sola sección vertical;
- manejo consistente de loading, errores y reintentos seguros.

Los componentes compartibles reciben servicios o hooks por interfaz y no importan Firebase, Supabase ni SQLite. No migres toda App.tsx en un único PR y no rediseñes la UI.

Agrega pruebas del cliente y del módulo extraído. Conserva comportamiento, textos y navegación.
```

## A10 — Crear shared-ui con una primera sección

```text
Objetivo: demostrar que una sección funcional de UI puede ser reutilizada por local y cloud.

Crea @personal-tax-ledger/shared-ui y mueve solamente una sección bien delimitada que ya use servicios abstractos y contratos compartidos.

shared-ui puede depender de React, core cuando corresponda y api-contracts, pero no puede importar:

- Firebase;
- Supabase;
- node:sqlite;
- variables de entorno específicas;
- URLs de despliegue hardcodeadas.

La aplicación local debe proporcionar el ApiClient y la configuración. Agrega un chequeo automático de imports prohibidos y pruebas visuales o de componentes si la base ya lo permite.
```

## A11 — Composition root local y estructura apps/local

```text
Objetivo: hacer explícito el ensamblaje de la edición local.

Crea un composition root que conecte:

- LocalAuthProvider;
- contexto constante local-workspace/local-user;
- repositorios SQLite;
- casos de uso;
- routers HTTP;
- frontend local.

Solo después de que las fronteras funcionen, mueve la aplicación hacia apps/local en operaciones pequeñas y preservando historial cuando Git lo permita. Mantén scripts raíz compatibles como fachada.

No agregues login local. No cambies la ruta de la base del usuario sin migración y rollback probados. Documenta claramente dónde queda el archivo SQLite y cómo respaldarlo.
```

## A12 — Preparar paquetes públicos y versionado

```text
Objetivo: permitir que el futuro repositorio privado consuma core, contracts, api-contracts y shared-ui sin copiar código.

Configura:

- exports públicos mínimos y explícitos;
- build reproducible;
- semantic versioning;
- changelog;
- política de compatibilidad;
- publicación dry-run o empaquetado local con npm pack;
- smoke test que instale los tarballs en un consumidor temporal.

No publiques realmente paquetes ni cambies visibilidad sin autorización. No expongas sqlite-adapter si no se necesita como paquete independiente.

Identifica qué paquetes pueden ser públicos y cuál es la superficie API estable inicial.
```

## A13 — CI, límites arquitectónicos y cierre de migración

```text
Objetivo: consolidar la arquitectura pública una vez migrados todos los módulos por iteraciones repetidas de A05–A10.

Agrega CI para:

- instalación limpia;
- tests unitarios, contractuales y de integración;
- build de paquetes y aplicación local;
- smoke test de ejecución local;
- validación de exports;
- prohibición de dependencias infraestructura -> core en sentido inverso;
- detección de ciclos relevantes;
- npm pack del núcleo consumible.

Actualiza README y documentación arquitectónica con el estado real. Elimina adaptadores transitorios solo si ya no tienen consumidores y sus reemplazos están cubiertos. No mezcles esta limpieza con funcionalidades nuevas.
```
