import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup-coverage.ts'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
});
