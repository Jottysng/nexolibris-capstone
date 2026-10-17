import { Prisma, type PrismaClient } from '../../prisma/generated/client/client.js';
import { AppError } from '../errors.js';
import { addDays, addHours, cleanWorkId } from '../utils.js';
import { getBook } from '../books/openLibrary.js';

export async function ensureBook(prisma: PrismaClient, workId: string) {
  const key = cleanWorkId(workId);
  const existing = await prisma.bookSnapshot.findUnique({ where: { openLibraryKey: key }, include: { inventory: true } });
  if (existing) return existing;
  const external = await getBook(key);
  return prisma.bookSnapshot.create({
    data: {
      openLibraryKey: key, title: external.title, description: external.description, authors: external.authors,
      coverId: external.coverId, firstPublishYear: external.firstPublishYear, subjects: external.subjects,
      isbn: external.isbn, inventory: { create: { totalCopies: 1 } },
    },
    include: { inventory: true },
  });
}

export async function borrowBook(prisma: PrismaClient, userId: string, workId: string) {
  const book = await ensureBook(prisma, workId);
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const activeForUser = await tx.loan.findFirst({ where: { userId, bookId: book.id, status: 'ACTIVE' } });
    if (activeForUser) throw new AppError(409, 'ALREADY_BORROWED', 'Ya tienes un préstamo activo de esta obra.');
    const inventory = await tx.inventory.findUniqueOrThrow({ where: { bookId: book.id } });
    const activeCount = await tx.loan.count({ where: { bookId: book.id, status: 'ACTIVE' } });
    const hold = await tx.reservation.findFirst({ where: { bookId: book.id, status: 'AVAILABLE' }, orderBy: { createdAt: 'asc' } });
    if (activeCount >= inventory.totalCopies || (hold && hold.userId !== userId && hold.availableUntil && hold.availableUntil > new Date())) {
      throw new AppError(409, 'NO_COPIES', 'No hay copias disponibles. Puedes reservar esta obra.');
    }
    if (hold?.userId === userId) await tx.reservation.update({ where: { id: hold.id }, data: { status: 'FULFILLED' } });
    return tx.loan.create({
      data: { userId, bookId: book.id, dueAt: addDays(new Date(), 14) },
      include: { book: true },
    });
  }, { isolationLevel: 'Serializable' });
}

export async function reserveBook(prisma: PrismaClient, userId: string, workId: string) {
  const book = await ensureBook(prisma, workId);
  const activeLoan = await prisma.loan.findFirst({ where: { userId, bookId: book.id, status: 'ACTIVE' } });
  if (activeLoan) throw new AppError(409, 'ALREADY_BORROWED', 'Ya tienes esta obra prestada.');
  const existing = await prisma.reservation.findFirst({ where: { userId, bookId: book.id, status: { in: ['WAITING', 'AVAILABLE'] } } });
  if (existing) throw new AppError(409, 'ALREADY_RESERVED', 'Ya tienes una reserva activa para esta obra.');
  return prisma.reservation.create({ data: { userId, bookId: book.id }, include: { book: true } });
}

export async function returnLoan(prisma: PrismaClient, userId: string, loanId: string) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const loan = await tx.loan.findFirst({ where: { id: loanId, userId, status: 'ACTIVE' }, include: { book: true } });
    if (!loan) throw new AppError(404, 'LOAN_NOT_FOUND', 'No encontramos el préstamo activo.');
    const returned = await tx.loan.update({ where: { id: loan.id }, data: { status: 'RETURNED', returnedAt: new Date() } });
    const next = await tx.reservation.findFirst({ where: { bookId: loan.bookId, status: 'WAITING' }, orderBy: { createdAt: 'asc' } });
    if (next) {
      const availableUntil = addHours(new Date(), 48);
      await tx.reservation.update({ where: { id: next.id }, data: { status: 'AVAILABLE', availableUntil, notifiedAt: new Date() } });
      await tx.notification.create({ data: {
        userId: next.userId, bookId: loan.bookId, type: 'RESERVATION_AVAILABLE',
        title: 'Tu reserva está disponible',
        message: `${loan.book.title} está disponible durante las próximas 48 horas.`,
      } });
    }
    return returned;
  }, { isolationLevel: 'Serializable' });
}
