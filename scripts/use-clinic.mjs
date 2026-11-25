import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { clinicSchema } from '../src/config/schema.ts'

const input = process.argv[2]
if (!input) throw new Error('Uso: npm run clinic:apply -- caminho/cliente.json')
const project = resolve(import.meta.dirname, '..')
const config = clinicSchema.parse(JSON.parse(await readFile(input, 'utf8')))
const assetDir = resolve(project, 'public/images/client')
const extension = { jpeg: 'jpg', png: 'png', webp: 'webp', avif: 'avif', gif: 'gif' }
const images = []
function extract(value) {
  if (typeof value === 'string') {
    const match = value.match(/^data:image\/(jpeg|png|webp|avif|gif);base64,(.+)$/)
    if (!match) return value
    const bytes = Buffer.from(match[2], 'base64')
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 20)
    const file = hash + '.' + extension[match[1]]
    images.push(writeFile(resolve(assetDir, file), bytes))
    return '/images/client/' + file
  }
  if (Array.isArray(value)) return value.map(extract)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, extract(item)]))
  return value
}

await mkdir(assetDir, { recursive: true })
const output = extract(config)
await Promise.all(images)
const target = resolve(project, 'src/config/clinic.config.ts')
await mkdir(dirname(target), { recursive: true })
await writeFile(target, "import type { ClinicConfig } from './schema.ts'\n\nexport const clinicConfig = " + JSON.stringify(output, null, 2) + ' satisfies ClinicConfig\n')
process.stdout.write('Configuração aplicada em src/config/clinic.config.ts. Imagens incorporadas extraídas em public/images/client/.\n')
