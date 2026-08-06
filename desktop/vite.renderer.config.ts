import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    react(),        // Enables JSX transform + React Fast Refresh (hot reload)
    tailwindcss(),  // Tailwind CSS v4 via Vite plugin (no postcss config needed)
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // @/ maps to src/ — same pattern as backend
    },
  },
});
