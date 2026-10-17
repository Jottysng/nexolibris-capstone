import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['server/test/**/*.integration.test.ts'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      JWT_ACCESS_SECRET: 'test-access-secret-that-is-long-enough-2026',
      JWT_REFRESH_SECRET: 'test-refresh-secret-that-is-long-enough-2026',
      APP_ORIGIN: 'http://localhost:5173',
      NODE_ENV: 'test',
    },
  },
});
