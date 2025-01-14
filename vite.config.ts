import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    minify: false, // Optional for easier debugging
    sourcemap: true, // Enable source maps
    outDir: 'dist', // Output directory for the build
    rollupOptions: {
      input: {
        main: './index.html', // Main entry point
        background: './src/background.ts', // Include background.ts as a separate entry
        affiliateMissing: './src/affiliate-missing.ts',
      },
      output: {
        entryFileNames: '[name].js', // Control naming pattern for output files
      },
    },
  },
});
