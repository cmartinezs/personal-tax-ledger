# Paquete B — creación del repositorio cloud privado

## Decisiones base

- Repositorio privado separado.
- Frontend React en Vercel y API Node en Render, salvo ADR posterior justificado.
- PostgreSQL administrado mediante Supabase.
- Firebase Authentication.
- Google como proveedor obligatorio.
- Email/contraseña de Firebase también se habilita para cumplir recuperación y cambio de contraseña.
- Las cuentas solo Google no muestran controles de contraseña; la contraseña se administra en Google.
- Una persona pertenece inicialmente a un workspace personal.
- Los agregados raíz privados llevan `workspace_id`; sus hijos se relacionan con el padre y no repiten una FK directa a usuario.
- Los catálogos tributarios globales y reglas oficiales no llevan `workspace_id`.
- El backend verifica Firebase ID tokens y deriva actor/workspace; nunca acepta owner IDs confiando en el cliente.
- Los datos financieros no se incluyen en analítica de producto, logs ni telemetría.

## B00 — Bootstrap privado y prueba de consumo del core

```text
Objetivo: crear el repositorio privado personal-tax-ledger-cloud como consumidor del repositorio público, sin implementar todavía funcionalidades de negocio.

Configura un monorepo pequeño:

- apps/web para Vercel;
- apps/api para Render;
- packages/cloud-contracts o infraestructura solo si es necesario;
- TypeScript y scripts raíz coherentes;
- variables de entorno documentadas mediante .env.example sin secretos.

Consume los paquetes públicos mediante una versión/tag inmutable o tarball de prueba. Prohíbe copiar fuentes del core. Implementa un smoke test que importe una función tributaria pública y verifique un resultado conocido.

Agrega ADR-001 con responsabilidades de ambos repositorios y estrategia de actualización/versionado.
```

## B01 — Modelo de tenancy y propiedad de datos

```text
Objetivo: definir y probar cómo se identifica la propiedad sin agregar user_id a cada tabla.

Diseña migraciones PostgreSQL para:

- app_users: perfil de aplicación vinculado por firebase_uid único;
- workspaces: contenedor de propiedad;
- workspace_memberships: relación actor-workspace y rol;
- agregados raíz con workspace_id;
- hijos vinculados a su raíz mediante FK;
- catálogos globales sin workspace_id.

Incluye restricciones, índices, claves UUID, timestamps, borrado lógico solo cuando tenga justificación y estrategia de cascada/restricción explícita.

Documenta el modelo de autorización: una consulta privada debe demostrar pertenencia al workspace. Agrega tests negativos de acceso cruzado. No migres todavía todas las tablas funcionales; demuestra el patrón con un agregado pequeño.
```

## B02 — Firebase Authentication y ciclo de cuenta

```text
Objetivo: implementar autenticación segura y coherente en frontend y API.

Incluye:

- alta/login con Google;
- alta/login con email y contraseña;
- verificación de email cuando corresponda;
- recuperación de contraseña por Firebase;
- actualización de contraseña con reautenticación reciente;
- vinculación segura Google <-> email/contraseña evitando cuentas duplicadas;
- logout y revocación/expiración de sesión;
- mensajes de error que no faciliten enumeración de cuentas.

Para cuentas solo Google, oculta recuperación/cambio de contraseña local y explica que la credencial se administra con Google.

La API debe verificar Firebase ID tokens con Firebase Admin, derivar firebase_uid y rechazar tokens ausentes, vencidos, manipulados o destinados a otro proyecto. No persistas contraseñas ni tokens en PostgreSQL o logs.
```

## B03 — Provisionamiento de usuario y workspace personal

```text
Objetivo: crear de forma idempotente el perfil mínimo y workspace personal después de autenticación válida.

Implementa un flujo transaccional que:

1. recibe una identidad Firebase verificada;
2. crea o recupera app_user por firebase_uid;
3. crea un workspace personal si no existe;
4. crea membership OWNER;
5. devuelve el contexto efectivo.

Debe tolerar reintentos y concurrencia sin duplicados. No confíes en nombre o email enviados por el cliente si Firebase ya los entrega; define qué campos son fuente de verdad y cuáles son editables.

Agrega tests de primera sesión, sesión repetida, carrera concurrente, email actualizado en proveedor y acceso denegado.
```

## B04 — Perfil y configuración de cuenta

```text
Objetivo: permitir consultar y editar el perfil sin mezclarlo con los datos tributarios.

Define un perfil mínimo y justificado: nombre visible, zona horaria, locale, moneda preferida y foto opcional referenciada. No solicites RUT, domicilio, teléfono, fecha de nacimiento ni otros datos si no son indispensables.

Implementa:

- ver perfil;
- editar campos permitidos;
- validación y límites;
- registro de updated_at;
- pantalla de seguridad con proveedores vinculados;
- cambio de contraseña solo para cuentas compatibles;
- reautenticación para operaciones sensibles.

Agrega auditoría de seguridad sin guardar valores anteriores sensibles.
```

## B05 — Consentimiento, versiones legales y evidencia

```text
Objetivo: implementar consentimiento demostrable y versionado, separándolo de la mera aceptación contractual.

Crea modelos para:

- legal_documents: tipo, versión, vigencia, hash y URL/contenido publicado;
- legal_acceptances: actor, documento, versión, instante, acción afirmativa y contexto mínimo;
- processing_purposes: finalidades específicas;
- consent_records: finalidad, estado, otorgamiento/retiro, versión del aviso y evidencia mínima;
- privacy_requests: solicitudes de derechos y estado.

Requisitos:

- ToS y tratamiento opcional no pueden compartir una casilla ambigua;
- ninguna casilla de consentimiento opcional viene premarcada;
- retirar consentimiento debe ser tan accesible como otorgarlo;
- el tratamiento necesario para prestar el servicio debe identificar su base y finalidad, sin fingir que todo depende de consentimiento;
- cambios materiales exigen nueva aceptación o consentimiento según corresponda;
- conservar evidencia sin guardar IP completa indefinidamente salvo justificación legal documentada.

Incluye pruebas de versión, retiro, reconsentimiento y acceso bloqueado cuando falte una aceptación obligatoria vigente.
```

## B06 — Privacy by design y derechos del titular

```text
Objetivo: preparar el producto para la Ley chilena 19.628 vigente y las modificaciones de la Ley 21.719 que entran en vigor el 1 de diciembre de 2026.

Implementa flujos y contratos para:

- acceso a los datos personales;
- rectificación;
- supresión cuando proceda;
- oposición y retiro de consentimiento cuando aplique;
- portabilidad en formato estructurado común;
- información sobre finalidades, categorías, destinatarios/encargados y conservación;
- canal de solicitud y trazabilidad de cumplimiento.

Define un inventario de tratamientos y una matriz: dato, finalidad, necesidad, ubicación, encargado, acceso, retención y eliminación/anonimización.

No declares cumplimiento legal definitivo. Genera documentación técnica y borradores para revisión jurídica. Incluye un proceso para actualizar criterios cuando la Agencia publique instrucciones.
```

## B07 — Persistencia cloud de un primer agregado funcional

```text
Objetivo: implementar de extremo a extremo un único agregado del producto usando Supabase/PostgreSQL y el core público.

Selecciona un agregado pequeño. Implementa:

- migración PostgreSQL;
- repositorio cloud que satisface los contract tests públicos;
- caso de uso con WorkspaceContext derivado por el backend;
- endpoints autenticados;
- frontend reutilizando shared-ui cuando exista;
- pruebas de aislamiento entre dos usuarios/workspaces.

Toda consulta y mutación privada debe quedar limitada al workspace efectivo. No aceptes workspace_id del body como fuente de autorización. No migres el resto de funcionalidades en este PR.
```

## B08 — Migración progresiva de funcionalidades compartidas

```text
Objetivo: repetir el patrón validado en B07 para un solo módulo adicional por PR.

Orden sugerido:

1. ingresos;
2. boletas;
3. hipotecarios y registros anuales;
4. settings por workspace/año;
5. snapshots y escenarios;
6. fuentes y parámetros globales administrados.

Para cada módulo exige migración, repositorio contractual, autorización, endpoints, UI, tests de aislamiento, índices y observabilidad sin datos financieros.

No dupliques el motor tributario en cloud. Si falta una capacidad, propón primero un cambio compatible en el repositorio público y consume una nueva versión.
```

## B09 — Seguridad de datos y separación de responsabilidades

```text
Objetivo: aplicar defensa en profundidad antes de incorporar usuarios reales.

Revisa e implementa:

- mínimo privilegio entre API y PostgreSQL;
- RLS como defensa adicional cuando la integración elegida permita establecer de forma confiable el contexto;
- autorización obligatoria también en la API;
- secretos solo en gestores/configuración de plataforma;
- CORS restrictivo, headers de seguridad y rate limits;
- protección CSRF según el mecanismo real de sesión;
- validación de archivos y payloads;
- cifrado en tránsito y capacidades de cifrado administrado;
- backups, restauración probada y retención;
- logs redactados y sin montos, RUT, tokens ni payloads financieros;
- procedimiento de incidentes y notificación para revisión legal.

Incluye threat model y tests de IDOR/acceso horizontal, tokens inválidos y escalamiento de rol. No afirmes que RLS reemplaza la autorización de aplicación.
```

## B10 — Estadísticas de uso respetuosas de la privacidad

```text
Objetivo: obtener estadísticas operativas y de producto sin capturar información financiera ni reconstruir el comportamiento sensible de una persona.

Define eventos permitidos mediante allowlist, por ejemplo:

- sesión iniciada;
- módulo visitado;
- simulación ejecutada;
- importación iniciada/completada/fallida;
- error técnico clasificado.

Prohibido registrar montos, nombres de empleadores/clientes, descripciones, RUT, contenidos CSV, resultados tributarios detallados o payloads.

Separa:

- métricas técnicas necesarias para seguridad/operación;
- analítica opcional de producto sujeta a consentimiento cuando corresponda.

Implementa agregación, retención corta de eventos crudos, anonimización/pseudonimización justificada, opt-out y documentación de finalidad. El panel administrativo debe mostrar agregados y evitar acceso rutinario a actividad individual.
```

## B11 — Comparativas mensuales y anuales

```text
Objetivo: permitir comparativas personales por periodo sin inferir meses a partir de datos insuficientes.

Primero define el modelo temporal:

- registros o snapshots asociados a tax_year y month cuando exista granularidad real;
- snapshots inmutables/versionados de resultados;
- zona horaria del workspace;
- reglas explícitas para meses sin información;
- prohibición de inventar distribución mensual desde un total anual, salvo proyección claramente rotulada.

Implementa:

- comparación mes contra mes;
- mismo mes del año anterior cuando haya datos;
- año contra año;
- tendencias de ingresos, retenciones, base imponible, impuesto estimado y ahorro APV;
- distinción visible entre dato real ingresado, estimación y proyección.

Los cálculos deben provenir del core público. Agrega tests de bordes de año, datos faltantes, cambio de parámetros tributarios y privacidad entre workspaces.
```

## B12 — ToS, privacidad y centro de privacidad

```text
Objetivo: crear las superficies de producto para transparencia y control del usuario.

Implementa páginas versionadas y accesibles para:

- Términos de Servicio;
- Política de Privacidad;
- Compromiso de Privacidad en lenguaje simple;
- Consentimientos y finalidades;
- proveedores/encargados relevantes y transferencias internacionales;
- retención y eliminación;
- derechos del titular y canal de contacto;
- exportar datos;
- solicitar rectificación o eliminación;
- retirar consentimientos opcionales;
- historial de aceptaciones.

El compromiso debe expresar que no se vende ni comparte información personal para fines ajenos al servicio y que cualquier comunicación a terceros se limita a encargados necesarios, obligación legal u otra base aplicable, o consentimiento específico del usuario. No prometas literalmente “nunca compartir con nadie”, porque Firebase, Supabase, Vercel y Render necesariamente procesan datos como proveedores y pueden existir obligaciones legales.

Marca los textos como borradores pendientes de revisión jurídica y evita dark patterns.
```

## B13 — Despliegue Vercel, Render y Supabase

```text
Objetivo: desplegar un entorno no productivo reproducible y seguro.

Configura:

- web en Vercel;
- API en Render;
- PostgreSQL/Supabase;
- Firebase por entorno;
- dominios y callbacks permitidos;
- secretos separados para dev/staging/prod;
- migraciones controladas;
- health/readiness checks;
- CI/CD con tests y rollback documentado;
- backups y prueba de restauración;
- observabilidad redactada;
- inventario de región/ubicación de tratamiento por proveedor.

No uses datos reales en staging. No habilites producción ni hagas pública la URL sin autorización explícita. Entrega una lista de verificación previa a producción y costos/riesgos de los planes gratuitos elegidos.
```

## B14 — Importación masiva CSV, última prioridad

```text
Objetivo: implementar importación CSV únicamente después de estabilizar autenticación, tenancy, privacidad y CRUD cloud.

Define formatos versionados y plantillas descargables por tipo de dato. Incluye:

- encoding, separador, locale y fechas explícitos;
- tamaño y número máximo de filas;
- validación completa antes de confirmar;
- preview con errores por fila;
- modo all-or-nothing o parcial como decisión explícita;
- idempotency key y detección de duplicados;
- transacción o estrategia de compensación;
- progreso y resumen;
- eliminación inmediata del archivo temporal después de procesarlo;
- prohibición de guardar contenido CSV en logs/analítica;
- aislamiento por workspace derivado del token, nunca desde una columna del CSV.

Agrega tests de CSV malicioso, fórmulas, columnas desconocidas, filas enormes, encoding inválido, duplicados, cancelación y acceso cruzado. Comienza con un solo formato y agregado.
```

## B15 — Preparación para producción y revisión final

```text
Objetivo: realizar una revisión integral antes de incorporar usuarios reales, sin declarar por cuenta propia conformidad legal definitiva.

Verifica:

- pruebas de aislamiento multiusuario;
- autenticación y reautenticación;
- recuperación y cambio de contraseña según proveedor;
- consentimiento versionado y retiro;
- exportación, rectificación y eliminación;
- retención y jobs de purga;
- restore de backups;
- dependencias y vulnerabilidades;
- threat model;
- ToS/privacidad revisados por profesional competente;
- contratos y anexos de tratamiento con proveedores cuando corresponda;
- transferencias internacionales;
- procedimiento de incidentes;
- plan de actualización para instrucciones de la Agencia de Protección de Datos Personales;
- monitoreo sin datos financieros.

Produce un go-live checklist con responsables, evidencia, estado PASS/FAIL/BLOCKED y riesgos aceptados explícitamente. Cualquier punto crítico FAIL o BLOCKED impide producción.
```

---

# Criterios jurídicos y de privacidad incorporados al diseño

Este paquete toma como referencia técnica la Ley 19.628 vigente y la Ley 21.719, publicada el 13 de diciembre de 2024 y con entrada en vigor diferida al **1 de diciembre de 2026**.

Principios considerados desde el diseño:

- licitud y lealtad;
- finalidad específica;
- proporcionalidad y minimización;
- calidad y actualización;
- responsabilidad demostrable;
- seguridad y confidencialidad;
- transparencia;
- conservación limitada;
- consentimiento libre, específico, inequívoco e informado cuando sea la base aplicable;
- acceso, rectificación, supresión, oposición y portabilidad según procedencia;
- evaluación de impacto cuando el tratamiento pueda representar alto riesgo.

Este documento es una guía de ingeniería y no reemplaza asesoría jurídica. Los Términos de Servicio, la Política de Privacidad, las bases de licitud, los plazos de respuesta, las transferencias internacionales y el procedimiento de incidentes deben ser revisados antes de producción.

## Fuentes oficiales de referencia

- Biblioteca del Congreso Nacional de Chile, Ley 21.719: https://www.bcn.cl/leychile/navegar?idNorma=1209272
- Versión con vigencia desde el 1 de diciembre de 2026: https://www.bcn.cl/leychile/Navegar/imprimir?idNorma=1209272&idParte=10527471&idVersion=2026-12-01
- Ley 19.628: https://www.bcn.cl/leychile/Navegar?idNorma=141599

---

# Orden recomendado resumido

No empieces cloud después de A00. El punto razonable para crear el repositorio privado es cuando A03, A04, A05, A06 y A12 hayan demostrado que al menos una porción del core y sus contratos puede instalarse desde fuera.

Secuencia sugerida:

```text
A00 → A01 → A02 → A03 → A04 → A05 → A06 → A07
                              ↓
                         A12 mínimo
                              ↓
                         B00 → B01 → B02 → B03

En público: continuar A08–A13 por módulos.
En privado: continuar B04–B15, un PR por prompt.
```

Si la UI compartida aún no está lista, el cloud puede comenzar con una pantalla técnica mínima, pero no debe copiar App.tsx. Debe esperar A09/A10 antes de incorporar las pantallas funcionales completas.
