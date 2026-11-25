import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist-export-kit',
    rollupOptions: { input: resolve(import.meta.dirname, 'export-site.html') },
  },
})
