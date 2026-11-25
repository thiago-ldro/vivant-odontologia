import { strToU8, zip } from 'fflate'
import type { ClinicConfig } from '../config/schema'
import { mapClinicImages, visibleClinicalCases } from './clinic-images'
import { clinicHead, clinicRobots, scriptJson } from './site-document'

export interface SiteKit {
  template: string
  assets: Record<string, string>
  media: Record<string, string>
  source: Record<string, string>
}

export type SiteFormat = 'static' | 'source'

const imageExtension: Record<string, string> = { jpeg: 'jpg', png: 'png', webp: 'webp', avif: 'avif', gif: 'gif' }
const configScript = '<script type="application/json" id="axyron-config">null</script>'
const vercel = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  framework: null,
  buildCommand: '',
  outputDirectory: '.',
}

const instructions = [
  'AXYRON — Site estático',
  '',
  'Netlify: extraia este ZIP e envie a pasta que contém index.html para https://app.netlify.com/drop.',
  'Vercel: extraia este ZIP, adicione os arquivos a um repositório Git e importe-o com o preset Other.',
  'A saída está na raiz da pasta. O site já está compilado.',
  '',
  'Para mudar dados da clínica, edite a configuração no AXYRON Studio e exporte um novo ZIP.',
].join('\n')

function decode(base64: string) {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
}

export async function packageSite(config: ClinicConfig, kit: SiteKit, format: SiteFormat): Promise<Uint8Array<ArrayBuffer>> {
  if (!kit.template.includes(configScript)) throw new Error('O modelo de exportação não foi compilado corretamente.')

  const files: Record<string, Uint8Array> = Object.create(null)
  const base = format === 'static' ? kit.assets : kit.source
  for (const [name, encoded] of Object.entries(base)) files[name] = decode(encoded)
  const mediaPrefix = format === 'source' ? 'public/' : ''

  const used = new Map<string, string>()
  let uploadCount = 0
  const published = mapClinicImages({ ...config, clinicalCases: visibleClinicalCases(config) }, (url) => {
    if (!url || url.startsWith('https://')) return url
    const existing = used.get(url)
    if (existing) return existing

    const uploaded = /^data:image\/(jpeg|png|webp|avif|gif);base64,([\w+/=]+)$/i.exec(url)
    if (uploaded) {
      const name = 'images/enviadas/imagem-' + ++uploadCount + '.' + imageExtension[uploaded[1].toLowerCase()]
      files[mediaPrefix + name] = decode(uploaded[2])
      used.set(url, '/' + name)
      return '/' + name
    }

    const name = url.slice(1)
    if (!url.startsWith('/') || !Object.hasOwn(kit.media, name)) {
      throw new Error('Imagem indisponível: ' + url + '. Envie esse arquivo pelo Studio ou informe uma URL HTTPS.')
    }
    files[mediaPrefix + name] = decode(kit.media[name])
    used.set(url, url)
    return url
  })

  if (format === 'static') {
    const html = kit.template
      .replace(configScript, () => configScript.replace('>null<', () => '>' + scriptJson(published) + '<'))
      .replace('</head>', () => clinicHead(published) + '\n</head>')
    files['index.html'] = strToU8(html)
    files['vercel.json'] = strToU8(JSON.stringify(vercel, null, 2) + '\n')
    files['netlify.toml'] = strToU8('[build]\n  publish = "."\n')
    files['LEIA-ME.txt'] = strToU8(instructions)
    for (const [name, value] of Object.entries(clinicRobots(published))) files[name] = strToU8(value)
  } else {
    files['src/config/clinic.config.ts'] = strToU8(
      "import type { ClinicConfig } from './schema.ts'\n\nexport const clinicConfig = " + JSON.stringify(published, null, 2) + ' satisfies ClinicConfig\n',
    )
    files['LEIA-ME.txt'] = strToU8([
      'AXYRON — Código-fonte do site',
      '',
      'Lovable: no painel, escolha + → Import project → Upload code e envie este ZIP.',
      'A importação reconstrói o projeto. Confira a prévia antes de publicar.',
      '',
      'Localmente, instale as dependências com npm install e gere a build com npm run build.',
      'Documentação: https://docs.lovable.dev/features/projects/import-project',
    ].join('\n'))
  }

  // The output already contains compressed WebP and WOFF2 files.
  return new Promise((resolve, reject) => zip(files, { level: 0 }, (error, result) => {
    if (error) reject(error)
    else resolve(new Uint8Array(result))
  }))
}
