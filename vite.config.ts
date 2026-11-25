import { defineConfig, type Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { clinicConfig } from './src/config/clinic.config.ts'
import { clinicSchema } from './src/config/schema.ts'
import { clinicHead, clinicRobots } from './src/lib/site-document.ts'

function clinicSeo(): Plugin {
  const config = clinicSchema.parse(clinicConfig)
  return {
    name: 'clinic-seo',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace('</head>', () => '  ' + clinicHead(config) + '\n  </head>')
      },
    },
    generateBundle() {
      for (const [fileName, source] of Object.entries(clinicRobots(config))) {
        this.emitFile({ type: 'asset', fileName, source })
      }
    },
  }
}

export default defineConfig({
  plugins: [tailwindcss(), clinicSeo()],
  server: { fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/studio.html', '**/src/studio.tsx', '**/src/components/studio/**', '**/dist-studio/**', '**/dist-export-kit/**', '**/artifacts/**'] } },
})
