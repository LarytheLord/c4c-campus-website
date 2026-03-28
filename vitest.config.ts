import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom', // Use jsdom for React component testing
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx', 'tests/components/**/*.test.tsx'],
    exclude: [
      'tests/integration/**',  // Integration tests have separate config
      'tests/e2e/**',          // E2E tests require Playwright
      'tests/*.test.ts',       // Root-level tests are integration tests requiring database/server
      'node_modules/**',       // Exclude node_modules
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        'dist/',
        '.astro/',
      ],
      // Coverage thresholds per quality-gates.md
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});