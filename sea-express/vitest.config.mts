import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // The database tests start an in-memory Postgres per file.
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
});
