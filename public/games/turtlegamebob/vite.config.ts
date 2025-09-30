import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    open: true,
    // Force cache invalidation
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2018',
    assetsInlineLimit: 8192
  },
  esbuild: {
    // Skip TypeScript type checking during development for faster builds
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  // Force cache invalidation
  optimizeDeps: {
    force: true
  }
});