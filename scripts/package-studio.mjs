import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { strToU8, zipSync } from 'fflate'

const dist = new URL('../artifacts/studio-portable/', import.meta.url)
const original = await readFile(new URL('studio.html', dist), 'utf8')
const script = /<script type="module"[^>]* src="([^"]+)"><\/script>/.exec(original)
const style = /<link rel="stylesheet"[^>]* href="([^"]+)">/.exec(original)
if (!script || !style) throw new Error('Build incompleta do Studio portátil.')
const bundle = (path) => readFile(new URL(path.replace(/^\//, ''), dist), 'utf8')
const [js, css] = await Promise.all([bundle(script[1]), bundle(style[1])])
const html = original
  .replace(script[0], () => '<script type="module">' + js.replace(/<\/script/gi, '<\\/script') + '</script>')
  .replace(style[0], () => '<style>' + css + '</style>')

const target = new URL('../artifacts/', import.meta.url)
await mkdir(target, { recursive: true })
await writeFile(new URL('AXYRON-Studio-Portatil.zip', target), zipSync({
  'AXYRON Studio.html': strToU8(html),
  'LEIA-ME.txt': strToU8('Extraia este ZIP e abra “AXYRON Studio.html” no Chrome ou no Edge.\n\nUse “Exportar site (.zip)” para publicar o site, ou “Exportar JSON” para guardar a configuração.\n'),
}, { level: 6 }))
