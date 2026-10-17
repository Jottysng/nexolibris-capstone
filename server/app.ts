import path from 'node:path';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './auth/routes.js';
import bookRoutes from './books/routes.js';
import libraryRoutes from './library/routes.js';
import { config, isProduction } from './config.js';
import { errorHandler, notFound } from './errors.js';
import { verifyOrigin } from './middleware/origin.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: isProduction ? undefined : false }));
app.use(cors({ origin: config.APP_ORIGIN, credentials: true }));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use(verifyOrigin);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'nexolibris' }));
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api', libraryRoutes);

if (isProduction) {
  const dist = path.resolve(process.cwd(), 'dist');
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(dist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
