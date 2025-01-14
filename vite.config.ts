import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true, // Enable source maps
    outDir: 'dist', // Output directory for the build
    rollupOptions: {
      input: {
        main: './index.html', // Main entry point
        background: './src/background.ts', // Include background.ts as a separate entry
      },
      output: {
        entryFileNames: '[name].js', // Control naming pattern for output files
      },
    },
  },
});
