import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: { target: 'es2022' },
  preview: {
    middleware: (req, res, next) => {
      if (req.url && !req.url.startsWith('/@') && !req.url.startsWith('/src') && !req.url.startsWith('/node_modules') && !req.url.includes('.')) {
        req.url = '/index.html';
      }
      next();
    },
  },
})
