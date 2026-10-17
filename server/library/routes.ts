import { Router } from 'express';
import { readingSchema } from '../../shared/contracts.js';
import { prisma } from '../db.js';
import { AppError, asyncHandler } from '../errors.js';
import { requireAuth } from '../auth/middleware.js';
import { borrowBook, ensureBook, reserveBook, returnLoan } from './service.js';

const router = Router();
router.use(requireAuth);

router.post('/books/:workId/borrow', asyncHandler(async (req, res) => {
  const loan = await borrowBook(prisma, req.user!.id, String(req.params.workId));
  res.status(201).json(loan);
}));

router.post('/books/:workId/reserve', asyncHandler(async (req, res) => {
  const reservation = await reserveBook(prisma, req.user!.id, String(req.params.workId));
  res.status(201).json(reservation);
}));

router.post('/loans/:id/return', asyncHandler(async (req, res) => {
  res.json(await returnLoan(prisma, req.user!.id, String(req.params.id)));
}));

router.get('/me/loans', asyncHandler(async (req, res) => {
  res.json(await prisma.loan.findMany({ where: { userId: req.user!.id }, include: { book: true }, orderBy: { borrowedAt: 'desc' } }));
}));

router.get('/me/reservations', asyncHandler(async (req, res) => {
  await prisma.reservation.updateMany({
    where: { userId: req.user!.id, status: 'AVAILABLE', availableUntil: { lt: new Date() } }, data: { status: 'EXPIRED' },
  });
  res.json(await prisma.reservation.findMany({ where: { userId: req.user!.id }, include: { book: true }, orderBy: { createdAt: 'desc' } }));
}));

router.delete('/me/reservations/:id', asyncHandler(async (req, res) => {
  const reservation = await prisma.reservation.findFirst({ where: { id: String(req.params.id), userId: req.user!.id, status: { in: ['WAITING', 'AVAILABLE'] } } });
  if (!reservation) throw new AppError(404, 'RESERVATION_NOT_FOUND', 'No encontramos la reserva activa.');
  await prisma.reservation.update({ where: { id: reservation.id }, data: { status: 'CANCELLED' } });
  res.status(204).end();
}));

router.get('/me/wishlist', asyncHandler(async (req, res) => {
  res.json(await prisma.userBookState.findMany({ where: { userId: req.user!.id, wishlistedAt: { not: null } }, include: { book: true }, orderBy: { wishlistedAt: 'desc' } }));
}));

router.put('/me/wishlist/:workId', asyncHandler(async (req, res) => {
  const book = await ensureBook(prisma, String(req.params.workId));
  const item = await prisma.userBookState.upsert({
    where: { userId_bookId: { userId: req.user!.id, bookId: book.id } },
    create: { userId: req.user!.id, bookId: book.id, wishlistedAt: new Date() },
    update: { wishlistedAt: new Date() }, include: { book: true },
  });
  res.json(item);
}));

router.delete('/me/wishlist/:workId', asyncHandler(async (req, res) => {
  const book = await prisma.bookSnapshot.findUnique({ where: { openLibraryKey: String(req.params.workId) } });
  if (book) await prisma.userBookState.updateMany({ where: { userId: req.user!.id, bookId: book.id }, data: { wishlistedAt: null } });
  res.status(204).end();
}));

router.get('/me/reading', asyncHandler(async (req, res) => {
  res.json(await prisma.userBookState.findMany({ where: { userId: req.user!.id, readingStatus: { not: null } }, include: { book: true }, orderBy: { updatedAt: 'desc' } }));
}));

router.put('/me/reading/:workId', asyncHandler(async (req, res) => {
  const input = readingSchema.parse(req.body);
  const book = await ensureBook(prisma, String(req.params.workId));
  res.json(await prisma.userBookState.upsert({
    where: { userId_bookId: { userId: req.user!.id, bookId: book.id } },
    create: { userId: req.user!.id, bookId: book.id, readingStatus: input.status },
    update: { readingStatus: input.status }, include: { book: true },
  }));
}));

router.delete('/me/reading/:workId', asyncHandler(async (req, res) => {
  const book = await prisma.bookSnapshot.findUnique({ where: { openLibraryKey: String(req.params.workId) } });
  if (book) await prisma.userBookState.updateMany({ where: { userId: req.user!.id, bookId: book.id }, data: { readingStatus: null } });
  res.status(204).end();
}));

router.get('/me/notifications', asyncHandler(async (req, res) => {
  res.json(await prisma.notification.findMany({ where: { userId: req.user!.id }, include: { book: true }, orderBy: { createdAt: 'desc' } }));
}));

router.put('/me/notifications/:id/read', asyncHandler(async (req, res) => {
  const item = await prisma.notification.findFirst({ where: { id: String(req.params.id), userId: req.user!.id } });
  if (!item) throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'No encontramos la notificación.');
  res.json(await prisma.notification.update({ where: { id: item.id }, data: { readAt: new Date() } }));
}));

router.delete('/me/notifications/:id', asyncHandler(async (req, res) => {
  const result = await prisma.notification.deleteMany({ where: { id: String(req.params.id), userId: req.user!.id } });
  if (!result.count) throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'No encontramos la notificación.');
  res.status(204).end();
}));

export default router;
