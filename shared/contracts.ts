import { z } from 'zod';

export const emailSchema = z.string().trim().email('Escribe un correo válido').transform((value) => value.toLowerCase());
export const passwordSchema = z.string().min(8, 'Usa al menos 8 caracteres').max(72, 'La contraseña es demasiado larga')
  .regex(/[A-Z]/, 'Incluye una letra mayúscula').regex(/[a-z]/, 'Incluye una letra minúscula')
  .regex(/\d/, 'Incluye un número');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Escribe tu nombre').max(80),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden', path: ['confirmPassword'],
});

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, 'Escribe tu contraseña') });
export const readingSchema = z.object({ status: z.enum(['TO_READ', 'READING', 'COMPLETED']) });

export type ApiErrorBody = { code: string; message: string; fieldErrors?: Record<string, string[]> };
export type Paged<T> = { items: T[]; page: number; pageSize: number; total: number; totalPages: number };
export type PublicUser = { id: string; name: string; email: string };

export type BookSummary = {
  workId: string;
  title: string;
  authors: string[];
  coverId: number | null;
  firstPublishYear: number | null;
  subjects: string[];
  editions: number;
  availability?: { total: number; available: number };
};

export type BookDetail = BookSummary & {
  description: string;
  isbn: string | null;
  links: Array<{ title: string; url: string }>;
};

export const coverUrl = (coverId: number | null, size: 'S' | 'M' | 'L' = 'M') =>
  coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : null;
