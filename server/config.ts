import 'dotenv/config';
import { z } from 'zod';

const configSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().default('nexolibris'),
  JWT_AUDIENCE: z.string().default('nexolibris-web'),
  APP_ORIGIN: z.string().url().default('http://localhost:5173'),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  OPEN_LIBRARY_CONTACT: z.string().url().default('https://github.com/Jottysng'),
});

export const config = configSchema.parse(process.env);
export const isProduction = config.NODE_ENV === 'production';
