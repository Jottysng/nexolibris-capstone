import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express';
import { Prisma } from '../prisma/generated/client/client.js';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(public status: number, public code: string, message: string, public fieldErrors?: Record<string, string[]>) {
    super(message);
  }
}

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => void fn(req, res, next).catch(next);

export const notFound = (_req: Request, _res: Response, next: NextFunction) =>
  next(new AppError(404, 'NOT_FOUND', 'No encontramos el recurso solicitado.'));

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  void _next;
  if (error instanceof ZodError) {
    const fields = error.flatten().fieldErrors as Record<string, string[]>;
    res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Revisa los datos enviados.', fieldErrors: fields });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    res.status(409).json({ code: 'CONFLICT', message: 'Ese registro ya existe.' });
    return;
  }
  if (error instanceof AppError) {
    res.status(error.status).json({ code: error.code, message: error.message, fieldErrors: error.fieldErrors });
    return;
  }
  console.error(error);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'No pudimos completar la solicitud.' });
};
