# NexoLibris

NexoLibris es una aplicación web para consultar libros y administrar servicios de una biblioteca universitaria. El catálogo público utiliza Open Library; los préstamos, reservas, listas personales y notificaciones se guardan en la base de datos propia de la aplicación.

## Funciones principales

- Catálogo público con búsqueda por título, autor o palabra clave.
- Filtros por tema, cinco criterios de orden y paginación de 24 resultados.
- Ficha de cada obra con portada, autoría, fecha, descripción y disponibilidad local.
- Registro e inicio de sesión con renovación segura de sesión.
- Préstamos de 14 días, devolución y consulta del historial.
- Reservas por orden de llegada. La primera persona de la cola recibe una retención de 48 horas cuando se devuelve una copia.
- Lista de deseos y seguimiento de lectura con los estados `Quiero leer`, `Leyendo` y `Completado`.
- Notificaciones internas, tema claro/oscuro y diseño adaptable a móvil.

## Tecnologías

| Capa | Herramientas |
| --- | --- |
| Interfaz | React, TypeScript, Vite, React Router, Lucide |
| Estado y datos | Redux Toolkit, RTK Query, Context para el tema |
| API | Express, Zod, Helmet, rate limiting |
| Datos | PostgreSQL, Prisma ORM y migraciones versionadas |
| Autenticación | bcrypt, JWT de acceso y cookie de renovación `HttpOnly` |
| Pruebas | Vitest, React Testing Library, MSW, Supertest y Testcontainers |
| Producción | Docker multietapa y Docker Compose |

## Arquitectura

```text
src/                  Interfaz React
  app/                Store, RTK Query, sesión y tema
  components/         Layout y componentes compartidos
  features/           Catálogo, autenticación y biblioteca personal
  pages/              Rutas públicas y protegidas
server/               API Express
  auth/                Tokens, sesiones y rutas de autenticación
  books/               Proxy y normalización de Open Library
  library/             Préstamos, reservas y listas personales
prisma/               Esquema, migraciones y datos de demostración
shared/               Contratos y validaciones compartidas
```

El frontend nunca consulta Open Library directamente. Express identifica la aplicación con `User-Agent`, normaliza los datos y guarda respuestas frecuentes durante diez minutos. La disponibilidad se calcula con el inventario y los préstamos de NexoLibris.

## Requisitos

- Node.js 24.11 o posterior.
- Docker Desktop para PostgreSQL y para las pruebas de integración.

## Configuración local

1. Copie `.env.example` como `.env`.
2. Reemplace los dos secretos JWT por cadenas aleatorias de 32 caracteres o más.
3. Inicie PostgreSQL:

```bash
docker compose up -d database
```

4. Instale, migre y cargue los datos iniciales:

```bash
npm ci
npm run prisma:generate
npm run db:migrate
npm run db:seed
```

5. Inicie la interfaz y la API:

```bash
npm run dev
```

La interfaz abre en `http://localhost:5173` y la API en `http://localhost:3000`.

## Cuenta de demostración

- Correo: `demo@nexolibris.test`
- Contraseña: `Lectura2026!`

La contraseña se guarda como hash bcrypt. La cuenta sirve para una presentación, pero el formulario de registro permanece disponible para cualquier visitante.

## Comandos

```bash
npm run dev             # interfaz y API en modo desarrollo
npm run typecheck       # revisión de tipos del cliente y servidor
npm run lint            # revisión estática
npm test                # pruebas una sola vez
npm run test:watch      # pruebas durante el desarrollo
npm run test:coverage   # reporte y umbrales de cobertura
npm run test:integration # préstamo y reserva con PostgreSQL temporal
npm run build           # compilación de producción
npm start               # servidor de producción ya compilado
```

## Autenticación

1. El servidor valida el formulario y compara la contraseña con bcrypt.
2. Entrega un access token de 15 minutos en la respuesta. Redux lo conserva solo en memoria.
3. Entrega un refresh token de siete días en una cookie `HttpOnly`, `Secure` en producción y `SameSite=Strict`.
4. RTK Query envía `Authorization: Bearer <token>` en las rutas privadas.
5. Si el token vence, el cliente solicita una renovación. El servidor rota el refresh token y revoca la sesión anterior.
6. Al cerrar sesión, el servidor revoca la sesión y elimina la cookie.

## API principal

| Método | Ruta | Uso |
| --- | --- | --- |
| POST | `/api/auth/register` | Crear cuenta |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/refresh` | Renovar sesión |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/books/search` | Buscar y paginar obras |
| GET | `/api/books/:workId` | Consultar el detalle |
| POST | `/api/books/:workId/borrow` | Registrar un préstamo |
| POST | `/api/books/:workId/reserve` | Entrar en la cola de reserva |
| POST | `/api/loans/:id/return` | Devolver un ejemplar |
| GET | `/api/me/loans` | Consultar préstamos e historial |
| GET | `/api/me/reservations` | Consultar reservas |
| GET | `/api/me/wishlist` | Consultar lista de deseos |
| GET | `/api/me/reading` | Consultar estados de lectura |
| GET | `/api/me/notifications` | Consultar avisos internos |

Los errores usan `{ code, message, fieldErrors? }`. Las búsquedas devuelven `{ items, page, pageSize, total, totalPages }`.

## Pruebas

Las pruebas de componentes consultan controles por rol, nombre accesible y texto visible. MSW sustituye Open Library; Supertest prueba la API y Testcontainers crea un PostgreSQL temporal para los casos concurrentes. Los umbrales son 80 % para líneas, funciones y sentencias, y 70 % para ramas.

## Docker y Dokploy

Para probar la versión de producción completa:

```bash
docker compose up --build
```

Abra `http://localhost:3000`. El contenedor espera el healthcheck de PostgreSQL, aplica las migraciones, ejecuta el seed y después inicia Express.

En Dokploy puede crear una aplicación Docker Compose, subir esta carpeta o conectarla a un repositorio y definir `POSTGRES_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `APP_ORIGIN` y `OPEN_LIBRARY_CONTACT_EMAIL`. Exponga el puerto interno `3000` y asocie el dominio HTTPS a la aplicación. No copie `.env` al servidor.

## Fuente del catálogo

NexoLibris usa [Open Library Search API](https://openlibrary.org/dev/docs/api/search), [Works API](https://openlibrary.org/dev/docs/api/books) y [Covers API](https://openlibrary.org/dev/docs/api/covers). Los datos bibliográficos pueden variar según las contribuciones disponibles en Open Library.
