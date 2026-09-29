import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    // O Three.js fica num arquivo próprio, carregado só depois da abertura.
    chunkSizeWarningLimit: 600,
  },
});
