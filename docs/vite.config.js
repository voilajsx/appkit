import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Vite configuration for @voilajsx/appkit documentation site
 */
export default defineConfig({
  plugins: [react()],

  // Resolve path aliases for cleaner imports
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@assets': resolve(__dirname, './src/assets'),
      '@styles': resolve(__dirname, './src/styles'),
      '@content': resolve(__dirname, './src/content'),
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'markdown-vendor': [
            'react-markdown',
            'rehype-highlight',
            'rehype-slug',
            'gray-matter',
          ],
        },
      },
    },
  },

  // For GitHub Pages deployment with repository name
  // Uses environment variable to determine base path for production
  base: '/',

  // Server configuration for development
  server: {
    port: 3000,
    open: true,
    cors: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-markdown'],
  },
});
