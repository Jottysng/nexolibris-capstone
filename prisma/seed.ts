import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const books = [
  { openLibraryKey: 'OL45883W', title: 'Cien años de soledad', authors: ['Gabriel García Márquez'], coverId: 8225261, firstPublishYear: 1967, subjects: ['Realismo mágico', 'Literatura colombiana'], totalCopies: 2 },
  { openLibraryKey: 'OL262758W', title: 'Don Quijote de la Mancha', authors: ['Miguel de Cervantes'], coverId: 10521270, firstPublishYear: 1605, subjects: ['Clásicos', 'Novela'], totalCopies: 1 },
  { openLibraryKey: 'OL82563W', title: 'El principito', authors: ['Antoine de Saint-Exupéry'], coverId: 12606145, firstPublishYear: 1943, subjects: ['Ficción', 'Fábula'], totalCopies: 2 },
];

async function seed() {
  const passwordHash = await bcrypt.hash('Lectura2026!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@nexolibris.test' },
    update: { name: 'Estudiante Demo', passwordHash },
    create: { name: 'Estudiante Demo', email: 'demo@nexolibris.test', passwordHash },
  });
  const reader = await prisma.user.upsert({
    where: { email: 'lector@nexolibris.test' },
    update: { name: 'Lector Invitado', passwordHash },
    create: { name: 'Lector Invitado', email: 'lector@nexolibris.test', passwordHash },
  });
  for (const item of books) {
    const { totalCopies, ...book } = item;
    await prisma.bookSnapshot.upsert({
      where: { openLibraryKey: book.openLibraryKey },
      update: { ...book, inventory: { upsert: { create: { totalCopies }, update: { totalCopies } } } },
      create: { ...book, description: `Edición de demostración de ${book.title}.`, isbn: null, inventory: { create: { totalCopies } } },
    });
  }
  const firstBook = await prisma.bookSnapshot.findUniqueOrThrow({ where: { openLibraryKey: books[0].openLibraryKey } });
  const reservedDemoBook = await prisma.bookSnapshot.findUniqueOrThrow({ where: { openLibraryKey: books[1].openLibraryKey } });
  await prisma.userBookState.upsert({
    where: { userId_bookId: { userId: user.id, bookId: firstBook.id } },
    update: { readingStatus: 'READING', wishlistedAt: new Date() },
    create: { userId: user.id, bookId: firstBook.id, readingStatus: 'READING', wishlistedAt: new Date() },
  });
  const prior = await prisma.notification.findFirst({ where: { userId: user.id, type: 'SYSTEM' } });
  if (!prior) await prisma.notification.create({ data: {
    userId: user.id, type: 'SYSTEM', title: 'Bienvenido a NexoLibris',
    message: 'Tu cuenta de demostración está lista para explorar el catálogo.',
  } });

  const demoLoanId = '26b63462-d70f-4c8c-860b-e440d6c0d886';
  const existingDemoLoan = await prisma.loan.findUnique({ where: { id: demoLoanId } });
  if (!existingDemoLoan) {
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + 14);
    await prisma.loan.create({ data: {
      id: demoLoanId,
      userId: reader.id,
      bookId: reservedDemoBook.id,
      dueAt,
      status: 'ACTIVE',
    } });
  }
}

seed().finally(async () => prisma.$disconnect());
