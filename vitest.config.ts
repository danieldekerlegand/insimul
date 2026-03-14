import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client', 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['server/__tests__/**/*.test.ts', 'shared/__tests__/**/*.test.ts', 'client/__tests__/**/*.test.ts', 'client/src/**/__tests__/**/*.test.ts'],
    testTimeout: 30000,
  },
});
