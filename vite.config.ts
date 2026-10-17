import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['server/test/**/*.integration.test.ts', '**/node_modules/**', '**/.git/**'],
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      JWT_ACCESS_SECRET: 'test-access-secret-that-is-long-enough-2026',
      JWT_REFRESH_SECRET: 'test-refresh-secret-that-is-long-enough-2026',
      APP_ORIGIN: 'http://localhost:5173',
      NODE_ENV: 'test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
      include: [
        'src/app/authSlice.ts',
        'src/app/ThemeContext.tsx',
        'src/components/**/*.tsx',
        'src/features/**/*.tsx',
        'src/pages/**/*.tsx',
        'shared/contracts.ts',
        'server/auth/tokens.ts',
        'server/utils.ts',
      ],
      exclude: ['**/*.test.{ts,tsx}', 'src/test/**'],
    },
  },
});
