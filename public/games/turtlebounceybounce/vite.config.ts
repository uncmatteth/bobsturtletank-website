import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2018',
    assetsInlineLimit: 8192
  },
  define: {
    // Fix process.env for browser
    'process.env': {}
  }
});


