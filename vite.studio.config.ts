import { readdirSync, readFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import type { SiteKit } from './src/lib/site-package'

const projectRoot = import.meta.dirname
const sourceFolders = ['src/components', 'src/config', 'src/styles']
const sourceFiles = [
  'index.html', 'vite.config.ts', 'vite.prerender.config.ts', 'tsconfig.json',
  'vercel.json', 'netlify.toml', 'LICENSE', 'src/main.tsx', 'src/App.tsx', 'src/prerender.tsx',
  'src/lib/booking.ts', 'src/lib/theme.ts', 'src/lib/seo.ts', 'src/lib/site-document.ts', 'src/lib/clinic-images.ts', 'scripts/prerender.mjs',
]

function sourceArchive() {
  const result: Record<string, string> = {}
  const files = [...sourceFiles]
  for (const folder of sourceFolders) {
    for (const file of readdirSync(resolve(projectRoot, folder), { recursive: true, withFileTypes: true })) {
      if (!file.isFile()) continue
      const name = relative(projectRoot, resolve(file.parentPath, file.name)).replaceAll('\\', '/')
      if (name.startsWith('src/components/studio/') || name === 'src/styles/studio.css' || name === 'src/config/clinic.config.ts') continue
      if (/\.(?:tsx?|css)$/.test(name)) files.push(name)
    }
  }
  for (const name of files) result[name] = readFileSync(resolve(projectRoot, name)).toString('base64')
  const original = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf8'))
  const dependencies = Object.fromEntries(Object.entries(original.dependencies).filter(([name]) => name !== 'fflate'))
  const devNames = ['vite', 'typescript', '@types/react', '@types/react-dom', '@types/node']
  const devDependencies = Object.fromEntries(devNames.map((name) => [name, original.devDependencies[name]]))
  result['package.json'] = Buffer.from(JSON.stringify({
    name: 'axyron-site',
    private: true,
    version: '1.0.0',
    type: 'module',
    engines: original.engines,
    scripts: { dev: original.scripts.dev, build: original.scripts.build, preview: original.scripts.preview },
    dependencies,
    devDependencies,
  }, null, 2)).toString('base64')
  return result
}

function exportKit(): Plugin {
  const virtualId = 'virtual:axyron-export-kit'
  return {
    name: 'axyron-export-kit',
    resolveId(id) {
      if (id === virtualId) return '\0' + virtualId
    },
    load(id) {
      if (id !== '\0' + virtualId) return
      const directory = resolve(import.meta.dirname, 'dist-export-kit')
      const kit: SiteKit = {
        template: readFileSync(resolve(directory, 'export-site.html'), 'utf8'),
        assets: {},
        media: {},
        source: sourceArchive(),
      }
      for (const file of readdirSync(directory, { recursive: true, withFileTypes: true })) {
        if (!file.isFile() || file.name === 'export-site.html') continue
        const path = resolve(file.parentPath, file.name)
        const name = path.slice(directory.length + 1).replaceAll('\\', '/')
        if (/\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/i.test(name)) kit.media[name] = readFileSync(path).toString('base64')
        else if (name.startsWith('assets/')) kit.assets[name] = readFileSync(path).toString('base64')
      }
      return 'export default ' + JSON.stringify(kit)
    },
  }
}

export default defineConfig(({ mode }) => {
  const portable = mode === 'portable'
  return {
    publicDir: portable ? false : 'public',
    plugins: [tailwindcss(), exportKit()],
    server: { host: '127.0.0.1', port: 5174, open: '/studio.html' },
    build: {
      outDir: portable ? 'artifacts/studio-portable' : 'dist-studio',
      assetsInlineLimit: portable ? () => true : undefined,
      rollupOptions: {
        input: resolve(import.meta.dirname, 'studio.html'),
        output: { inlineDynamicImports: portable },
      },
    },
  }
})
