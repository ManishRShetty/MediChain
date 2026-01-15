import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['ng2-pdf-viewer'], // Prevent Vite from pre-optimizing this package
  },
});
