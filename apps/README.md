# Apps

Aplicaciones y consumidores ejecutables del monorepo. Una app define un composition root; los paquetes contienen las reglas, contratos, casos de uso, persistencia y componentes reutilizables.

## Aplicaciones

- [`local/README.md`](local/README.md): host HTTP, composición y runtime multiplataforma.
- [`external-consumer/README.md`](external-consumer/README.md): verificación de la API pública sin `server`, `web`, `sqlite-adapter` ni `apps/local`.

No crear `apps/windows`: Windows es una plataforma soportada por `apps/local`.
