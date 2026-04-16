import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json'],
      include: ['src/modules/**/*.ts'],
      exclude: ['**/__tests__/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@plugins': path.resolve(__dirname, 'src/plugins'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@common': path.resolve(__dirname, 'src/common'),
    },
  },
})
