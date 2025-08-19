import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  globals: true,
  exclude: ['e2e/**', 'node_modules/**', '.next/**', 'coverage/**'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      thresholds: {
        lines: 68,
        functions: 68,
        branches: 58,
        statements: 68
      }
    }
  }
});
