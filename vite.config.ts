
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Alterado de './' para '/' para melhor compatibilidade com o servidor dev
  define: {
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY || '')
    }
  },
  server: {
    open: true, // Abre o navegador automaticamente
    port: 5173
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
        }
      }
    }
  }
});
