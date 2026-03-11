import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ReaderApp/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'markdown': ['react-markdown', 'remark-gfm', 'rehype-highlight', 'rehype-slug'],
          'highlight': ['highlight.js'],
          'dnd': ['@hello-pangea/dnd'],
        },
      },
    },
  },
})
