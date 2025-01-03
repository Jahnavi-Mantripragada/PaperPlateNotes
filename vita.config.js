import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Points to the root directory
  build: {
    outDir: 'dist', // Output folder
    rollupOptions: {
      input: 'index.html', // Entry point for the app
    },
  },
});
