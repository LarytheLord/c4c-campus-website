import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Use Node environment for integration tests (not jsdom)
    setupFiles: [], // NO setup files - we don't want mocks!
    include: ['tests/integration/**/*.test.ts'],
    testTimeout: 30000, // 30s timeout for database operations
    fileParallelism: false, // Run test files one at a time (Vitest 4.0)
    sequence: {
      concurrent: false, // Run tests sequentially within files
    },
    pool: 'forks', // Run tests in separate processes
    isolate: true, // Isolate test files from each other
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
