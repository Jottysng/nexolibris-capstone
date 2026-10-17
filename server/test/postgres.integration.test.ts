import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/client/client.js';
import { Pool } from 'pg';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { borrowBook, reserveBook, returnLoan } from '../library/service.js';

describe('préstamos y reservas con PostgreSQL', () => {
  let container: StartedPostgreSqlContainer | undefined;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const externalDatabase = process.env.TEST_DATABASE_URL;
    container = externalDatabase ? undefined : await new PostgreSqlContainer('postgres:17-alpine').start();
    const connectionString = externalDatabase ?? container!.getConnectionUri();
    if (!externalDatabase) {
      const pool = new Pool({ connectionString });
      const sql = await readFile(new URL('../../prisma/migrations/20261017000000_init/migration.sql', import.meta.url), 'utf8');
      await pool.query(sql);
      await pool.end();
    }
    const adapter = new PrismaPg({ connectionString });
    prisma = new PrismaClient({ adapter });
  });

  afterAll(async () => {
    await prisma?.$disconnect();
    await container?.stop();
  });

  it('impide el préstamo doble y promueve la primera reserva al devolver', async () => {
    const suffix = randomUUID();
    const [first, second] = await Promise.all([
      prisma.user.create({ data: { name: 'Laura', email: `laura.${suffix}@test.local`, passwordHash: 'hash' } }),
      prisma.user.create({ data: { name: 'Mateo', email: `mateo.${suffix}@test.local`, passwordHash: 'hash' } }),
    ]);
    const workId = `TEST${suffix.replaceAll('-', '')}`;
    await prisma.bookSnapshot.create({ data: {
      openLibraryKey: workId, title: 'Don Quijote de la Mancha', authors: ['Miguel de Cervantes'],
      subjects: ['Clásicos'], inventory: { create: { totalCopies: 1 } },
    } });

    const loan = await borrowBook(prisma, first.id, workId);
    await expect(borrowBook(prisma, second.id, workId)).rejects.toMatchObject({ code: 'NO_COPIES' });
    const reservation = await reserveBook(prisma, second.id, workId);
    expect(reservation.status).toBe('WAITING');

    await returnLoan(prisma, first.id, loan.id);
    const promoted = await prisma.reservation.findUniqueOrThrow({ where: { id: reservation.id } });
    const notification = await prisma.notification.findFirstOrThrow({ where: { userId: second.id } });
    expect(promoted.status).toBe('AVAILABLE');
    expect(promoted.availableUntil).not.toBeNull();
    expect(notification.title).toBe('Tu reserva está disponible');
  });
});
