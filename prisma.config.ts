import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const localDatabaseUrl = 'postgresql://nexolibris:nexolibris_local@localhost:5432/nexolibris?schema=public';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  // Prisma solo necesita una URL con formato válido para generar el cliente.
  // En ejecución, Dokploy y Docker Compose siempre proporcionan la conexión real.
  datasource: { url: process.env.DATABASE_URL ?? localDatabaseUrl },
});
