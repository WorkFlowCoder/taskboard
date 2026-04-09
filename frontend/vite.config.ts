import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/profile': {
        target: 'http://localhost:8000', // Replace with your backend server URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/profile/, '/profile'),
      },
    },
  },
});
