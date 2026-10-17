import { Router } from 'express';
import { prisma } from '../db.js';
import { asyncHandler } from '../errors.js';
import { clampPage, cleanWorkId } from '../utils.js';
import { getBook, searchBooks } from './openLibrary.js';

const router = Router();

router.get('/search', asyncHandler(async (req, res) => {
  const page = clampPage(req.query.page);
  const q = String(req.query.q ?? '').trim().slice(0, 120);
  const category = String(req.query.category ?? '').trim().slice(0, 80) || undefined;
  const sort = ['relevance', 'popularity', 'author', 'newest', 'oldest'].includes(String(req.query.sort)) ? String(req.query.sort) : 'relevance';
  const result = await searchBooks({ q, category, sort, page, pageSize: 24 });
  const localBooks = await prisma.bookSnapshot.findMany({
    where: { openLibraryKey: { in: result.items.map((item) => item.workId) } },
    include: { inventory: true, loans: { where: { status: 'ACTIVE' }, select: { id: true } } },
  });
  const availability = new Map(localBooks.map((book: (typeof localBooks)[number]) => [book.openLibraryKey, {
    total: book.inventory?.totalCopies ?? 1,
    available: Math.max(0, (book.inventory?.totalCopies ?? 1) - book.loans.length),
  }]));
  res.json({ ...result, items: result.items.map((item) => ({ ...item, availability: availability.get(item.workId) ?? { total: 1, available: 1 } })) });
}));

router.get('/:workId', asyncHandler(async (req, res) => {
  const workId = cleanWorkId(String(req.params.workId));
  const book = await getBook(workId);
  const local = await prisma.bookSnapshot.findUnique({
    where: { openLibraryKey: workId }, include: { inventory: true, loans: { where: { status: 'ACTIVE' }, select: { id: true } } },
  });
  const total = local?.inventory?.totalCopies ?? 1;
  res.json({ ...book, availability: { total, available: Math.max(0, total - (local?.loans.length ?? 0)) } });
}));

export default router;
