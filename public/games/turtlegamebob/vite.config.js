import { defineConfig } from 'vite'

export default defineConfig({
  // Development server config
  server: {
    port: 5173,
    host: true,
    open: '/complete-roguelike.html'
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: 'complete-roguelike.html',
        // Include other HTML files if needed
        clean: 'clean-game.html',
        roguelike: 'roguelike-game.html'
      },
      output: {
        // Ensure assets are properly organized
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  
  // Asset handling
  assetsInclude: ['**/*.mp3', '**/*.wav', '**/*.ogg', '**/*.png', '**/*.jpg', '**/*.jpeg'],
  
  // Public directory
  publicDir: 'public',
  
  // Base URL for deployment
  base: './',
  
  // Optimization
  optimizeDeps: {
    include: ['phaser', 'rot-js']
  },
  
  // Environment variables
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})
