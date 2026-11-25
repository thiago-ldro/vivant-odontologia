import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: false,
  build: { ssr: 'src/prerender.tsx', outDir: 'artifacts/prerender', emptyOutDir: true },
})
