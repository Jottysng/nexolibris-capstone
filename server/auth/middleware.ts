import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { AppError } from '../errors.js';
import { verifyAccessToken } from './tokens.js';

export const requireAuth: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) return next(new AppError(401, 'UNAUTHORIZED', 'Inicia sesión para continuar.'));
  try {
    const payload = verifyAccessToken(header.slice(7));
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new AppError(401, 'TOKEN_EXPIRED', 'La sesión venció. Vuelve a iniciar sesión.'));
  }
};
