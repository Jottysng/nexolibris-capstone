# NexoLibris

NexoLibris es una biblioteca universitaria full-stack en español. Permite explorar el catálogo público de Open Library y administrar servicios propios de préstamo, reservas por orden de llegada, seguimiento de lectura, lista de deseos y notificaciones.

- Aplicación: [https://nexolibris.161-153-45-177.nip.io](https://nexolibris.161-153-45-177.nip.io)
- Repositorio: [https://github.com/Jottysng/nexolibris-capstone](https://github.com/Jottysng/nexolibris-capstone)

![NexoLibris en escritorio](docs/nexolibris-escritorio.png)

<p align="center"><img src="docs/nexolibris-movil.png" width="390" alt="NexoLibris en móvil" /></p>

## Funciones principales

- Catálogo público con búsqueda por título, autor o palabra clave.
- Filtros por tema, cinco criterios de orden y paginación de 24 resultados.
- Ficha de cada obra con portada, autoría, fecha, descripción y disponibilidad local.
- Registro, inicio de sesión, renovación segura y cierre de sesión.
- Préstamos de 14 días, devolución e historial.
- Reservas FIFO. La primera persona de la cola recibe una retención de 48 horas cuando se devuelve una copia.
- Lista de deseos y estados `Quiero leer`, `Leyendo` y `Completado`.
- Notificaciones internas, tema claro/oscuro y navegación adaptable a móvil.

## Tecnologías

| Capa | Herramientas |
| --- | --- |
| Interfaz | React 19, TypeScript, Vite, React Router y Lucide |
| Estado y datos | Redux Toolkit, RTK Query y Context para el tema |
| API | Express 5, Zod, Helmet y rate limiting |
| Persistencia | PostgreSQL 17, Prisma ORM y migraciones versionadas |
| Autenticación | bcrypt, JWT de acceso y cookie de renovación `HttpOnly` |
| Pruebas | Vitest, React Testing Library y Testcontainers |
| Producción | Docker multietapa y Dokploy |

## Arquitectura

```text
src/                  Interfaz React
  app/                Store, RTK Query, sesión y tema
  components/         Layout y componentes compartidos
  features/           Catálogo, autenticación y biblioteca personal
  pages/              Rutas públicas y protegidas
server/               API Express
  auth/               Tokens, sesiones y rutas de autenticación
  books/              Proxy y normalización de Open Library
  library/            Préstamos, reservas y listas personales
prisma/               Esquema, migraciones y seed de demostración
shared/               Contratos y validaciones compartidas
docs/                 Capturas verificadas de la interfaz
```

El navegador no consulta Open Library directamente. Express identifica la aplicación con `User-Agent`, normaliza la respuesta y conserva consultas frecuentes durante diez minutos. La disponibilidad se calcula con el inventario y los préstamos de NexoLibris.

## Requisitos

- Node.js 24.11 o posterior.
- Docker Desktop para PostgreSQL y las pruebas de integración.

## Configuración local

1. Copie `.env.example` como `.env`.
2. Reemplace los secretos JWT por cadenas aleatorias de al menos 32 caracteres.
3. Inicie PostgreSQL e instale las dependencias:

```bash
docker compose up -d database
npm ci
```

`npm ci` genera automáticamente el cliente de Prisma. Después aplique la migración y el seed:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

La interfaz abre en `http://localhost:5173` y Vite redirige `/api` a `http://localhost:3000`.

## Usuarios de demostración

| Perfil | Correo | Contraseña | Estado inicial |
| --- | --- | --- | --- |
| Estudiante | `demo@nexolibris.test` | `Lectura2026!` | Lista de lectura y bienvenida |
| Lector | `lector@nexolibris.test` | `Lectura2026!` | Préstamo activo de *Don Quijote de la Mancha* |

### Flujo reproducible de la demo

1. Inicie sesión como Estudiante y reserve *Don Quijote de la Mancha*.
2. Cierre sesión e ingrese como Lector.
3. Abra **Préstamos** y devuelva el ejemplar.
4. Regrese a la cuenta Estudiante.
5. Abra **Notificaciones**: la reserva aparece disponible por 48 horas.

Las contraseñas se almacenan únicamente como hashes bcrypt. El formulario de registro continúa disponible para cualquier visitante.

## Comandos

```bash
npm run dev              # interfaz y API en desarrollo
npm run typecheck        # tipos del cliente y el servidor
npm run lint             # revisión estática
npm test                 # pruebas unitarias y de componentes
npm run test:watch       # pruebas durante el desarrollo
npm run test:coverage    # cobertura con umbrales obligatorios
npm run test:integration # préstamo y reserva con PostgreSQL temporal
npm run build            # generación Prisma y compilación de producción
npm start                # servidor compilado fuera de Docker
```

## Autenticación

1. El servidor valida el formulario y compara la contraseña con bcrypt.
2. El access token dura 15 minutos y Redux lo conserva solamente en memoria.
3. El refresh token dura siete días y viaja en una cookie `HttpOnly`, `Secure` en producción y `SameSite=Strict`.
4. RTK Query envía `Authorization: Bearer <token>` en las rutas privadas.
5. Cuando el access token vence, el cliente solicita una renovación. El servidor rota el refresh token y revoca la sesión anterior.
6. Al cerrar sesión, el servidor revoca la sesión y elimina la cookie.

Helmet configura cabeceras defensivas; el inicio de sesión tiene límite de solicitudes; las escrituras verifican el origen y todos los cuerpos se validan con Zod.

## API principal

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `/api/health` | Estado del servicio |
| POST | `/api/auth/register` | Crear cuenta |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/refresh` | Rotar la sesión |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/books/search` | Buscar y paginar obras |
| GET | `/api/books/:workId` | Consultar detalle y disponibilidad |
| POST | `/api/books/:workId/borrow` | Registrar préstamo |
| POST | `/api/books/:workId/reserve` | Entrar en la cola FIFO |
| POST | `/api/loans/:id/return` | Devolver y promover reserva |
| GET | `/api/me/loans` | Préstamos e historial |
| GET | `/api/me/reservations` | Reservas |
| GET | `/api/me/wishlist` | Lista de deseos |
| GET | `/api/me/reading` | Estados de lectura |
| GET | `/api/me/notifications` | Avisos internos |

Los errores usan `{ code, message, fieldErrors? }`. Las búsquedas devuelven `{ items, page, pageSize, total, totalPages }`.

## Pruebas y resultados

Las pruebas de interfaz consultan controles por rol, nombre accesible y texto visible. La integración levanta un PostgreSQL 17 temporal con Testcontainers y comprueba que una copia no admita dos préstamos simultáneos, que la reserva conserve el orden y que la devolución genere su notificación.

Resultados de la entrega B.7:

- 13 archivos y 34 pruebas unitarias o de componentes aprobadas.
- 1 prueba transaccional con PostgreSQL aprobada.
- 94.02 % de líneas.
- 84.02 % de sentencias.
- 80 % de funciones.
- 72.05 % de ramas.
- 0 vulnerabilidades reportadas por `npm audit`.

## Docker y despliegue

Para reproducir producción localmente:

```bash
docker compose up --build -d
curl http://localhost:3000/api/health
```

PostgreSQL se publica solamente en `127.0.0.1` durante el desarrollo. El contenedor de la aplicación espera el healthcheck, aplica migraciones, ejecuta el seed y después inicia Express en el puerto `3000`.

En Dokploy se usan dos servicios dentro de la red privada:

- `nexolibris-db`: PostgreSQL persistente, sin puerto público.
- `nexolibris`: aplicación Dockerfile, contexto `.`, puerto interno `3000`.

Variables requeridas:

```env
DATABASE_URL=postgresql://USUARIO:CONTRASENA@nexolibris-db:5432/nexolibris?schema=public
JWT_ACCESS_SECRET=valor-aleatorio-de-32-caracteres-o-mas
JWT_REFRESH_SECRET=otro-valor-aleatorio-de-32-caracteres-o-mas
JWT_ISSUER=nexolibris
JWT_AUDIENCE=nexolibris-web
APP_ORIGIN=https://nexolibris.161-153-45-177.nip.io
OPEN_LIBRARY_CONTACT=https://github.com/Jottysng
NODE_ENV=production
PORT=3000
```

El dominio usa HTTPS mediante Let's Encrypt. La base no debe recibir un dominio ni una asignación de puerto público.

## Guion breve de demostración

1. Presentar el catálogo y buscar una obra.
2. Mostrar filtros, URL persistente y detalle del libro.
3. Iniciar sesión con la cuenta Estudiante.
4. Ejecutar el flujo de reserva, devolución y notificación con los dos usuarios.
5. Mostrar tema oscuro, vista móvil, pruebas, arquitectura y `/api/health`.

## Fuente del catálogo

NexoLibris usa [Open Library Search API](https://openlibrary.org/dev/docs/api/search), [Works API](https://openlibrary.org/dev/docs/api/books) y [Covers API](https://openlibrary.org/dev/docs/api/covers). Los datos bibliográficos pueden variar según las contribuciones disponibles en Open Library.
