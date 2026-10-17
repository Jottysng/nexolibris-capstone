import type { NextFunction, Request, Response } from 'express';
import { config } from '../config.js';
import { AppError } from '../errors.js';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

export function verifyOrigin(req: Request, _res: Response, next: NextFunction) {
  if (safeMethods.has(req.method) || !req.get('origin') || req.get('origin') === config.APP_ORIGIN) return next();
  next(new AppError(403, 'INVALID_ORIGIN', 'El origen de la solicitud no está autorizado.'));
}
