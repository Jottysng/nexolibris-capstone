import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { addDays } from '../utils.js';
import { loginSchema, registerSchema } from '../../shared/contracts.js';
import { prisma } from '../db.js';
import { AppError, asyncHandler } from '../errors.js';
import { isProduction } from '../config.js';
import { requireAuth } from './middleware.js';
import { issueAccessToken, issueRefreshToken, verifyRefreshToken } from './tokens.js';

const router = Router();
const refreshCookie = 'nexolibris_refresh';
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict' as const,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'RATE_LIMITED', message: 'Espera unos minutos antes de volver a intentarlo.' },
});

const publicUser = (user: { id: string; name: string; email: string }) => ({ id: user.id, name: user.name, email: user.email });

async function createSession(user: { id: string; email: string }) {
  const refresh = issueRefreshToken(user);
  await prisma.session.create({ data: { jti: refresh.jti, userId: user.id, expiresAt: addDays(new Date(), 7) } });
  return { accessToken: issueAccessToken(user), refreshToken: refresh.token };
}

router.post('/register', loginLimiter, asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new AppError(409, 'EMAIL_IN_USE', 'Ya existe una cuenta con ese correo.', { email: ['El correo ya está registrado'] });
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({ data: { name: input.name, email: input.email, passwordHash } });
  const session = await createSession(user);
  res.cookie(refreshCookie, session.refreshToken, cookieOptions);
  res.status(201).json({ user: publicUser(user), accessToken: session.accessToken });
}));

router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'El correo o la contraseña no son correctos.');
  }
  const session = await createSession(user);
  res.cookie(refreshCookie, session.refreshToken, cookieOptions);
  res.json({ user: publicUser(user), accessToken: session.accessToken });
}));

router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies?.[refreshCookie];
  if (!token) throw new AppError(401, 'NO_SESSION', 'No hay una sesión activa.');
  let payload;
  try { payload = verifyRefreshToken(token); } catch { throw new AppError(401, 'INVALID_SESSION', 'La sesión ya no es válida.'); }
  const session = await prisma.session.findUnique({ where: { jti: payload.jti }, include: { user: true } });
  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    throw new AppError(401, 'INVALID_SESSION', 'La sesión ya no es válida.');
  }
  const replacement = issueRefreshToken(session.user, randomUUID());
  await prisma.$transaction([
    prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date(), replacedByJti: replacement.jti } }),
    prisma.session.create({ data: { jti: replacement.jti, userId: session.userId, expiresAt: addDays(new Date(), 7) } }),
  ]);
  res.cookie(refreshCookie, replacement.token, cookieOptions);
  res.json({ user: publicUser(session.user), accessToken: issueAccessToken(session.user) });
}));

router.post('/logout', asyncHandler(async (req, res) => {
  const token = req.cookies?.[refreshCookie];
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      await prisma.session.updateMany({ where: { jti: payload.jti, revokedAt: null }, data: { revokedAt: new Date() } });
    } catch { /* La cookie inválida se elimina igualmente. */ }
  }
  res.clearCookie(refreshCookie, cookieOptions);
  res.status(204).end();
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'No encontramos la cuenta.');
  res.json({ user: publicUser(user) });
}));

export default router;
