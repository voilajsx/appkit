import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Global timeout for all tests (15 seconds)
    testTimeout: 15000,

    // Your existing configuration
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: ['node_modules', 'src/**/examples/**', 'src/**/tests/**'],
    },
  },
});
