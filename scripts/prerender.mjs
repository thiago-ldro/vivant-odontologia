import { readdir, readFile, writeFile } from 'node:fs/promises'
import { clinicConfig } from '../src/config/clinic.config.ts'
import { render } from '../artifacts/prerender/prerender.js'

const index = new URL('../dist/index.html', import.meta.url)
const html = await readFile(index, 'utf8')
const markup = render().replace(/^<link rel="preload" as="image"[^>]+\/>/, '')
const marker = '<div id="root"></div>'
if (!html.includes(marker)) throw new Error('Contêiner do site ausente.')
const files = await readdir(new URL('../dist/assets/', import.meta.url))
/** @type {import('../src/config/schema.ts').ClinicConfig} */
const config = clinicConfig
const { heading, body } = config.fonts
const fonts = files.filter((file) =>
  ((heading === 'Manrope' || body === 'Manrope') && file.startsWith('manrope-latin-wght-normal-')) ||
  (heading === 'Newsreader' && file.startsWith('newsreader-latin-wght-normal-')) ||
  (heading === 'Newsreader' && clinicConfig.copy.heroEmphasis && file.startsWith('newsreader-latin-wght-italic-')),
)
const hints = fonts.map((file) => '<link rel="preload" as="font" href="/assets/' + file + '" type="font/woff2" crossorigin>').join('')
await writeFile(index, html.replace('</head>', () => hints + '</head>').replace(marker, () => '<div id="root">' + markup + '</div>'))
