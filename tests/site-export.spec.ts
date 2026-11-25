import { expect, test, type Page } from '@playwright/test'
import { strFromU8, unzipSync } from 'fflate'
import { readFile, mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, extname, join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { execFile } from 'node:child_process'
import { clinicConfig } from '../src/config/clinic.config'

const run = promisify(execFile)
const studio = 'http://127.0.0.1:4181/studio.html'
const studioArchive = 'artifacts/AXYRON-Studio-Portatil.zip'
const image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jVZcAAAAASUVORK5CYII='

async function download(page: Page, action: string) {
  const [result] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: action, exact: true }).click(),
  ])
  return { files: unzipSync(await readFile((await result.path())!)), name: result.suggestedFilename() }
}

async function serveZip(files: Record<string, Uint8Array>) {
  const mime: Record<string, string> = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
    '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2',
  }
  const server = createServer((request, response) => {
    const path = new URL(request.url ?? '/', 'http://localhost').pathname.slice(1) || 'index.html'
    const file = files[path]
    if (!file) {
      response.writeHead(404).end()
      return
    }
    response.writeHead(200, { 'Content-Type': mime[extname(path)] ?? 'application/octet-stream' }).end(file)
  })
  await new Promise<void>((finish) => server.listen(0, '127.0.0.1', finish))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Servidor de teste sem porta')
  return { url: 'http://127.0.0.1:' + address.port, stop: () => { server.closeAllConnections(); server.close() } }
}

test('ZIP estático publica os dados e a imagem enviados, com navegação e WhatsApp', async ({ page }) => {
  await page.goto(studio)
  await page.getByText('Configuração', { exact: true }).click()
  const config = {
    ...clinicConfig,
    name: 'Clínica Áurea',
    slogan: 'Odontologia perto de você.',
    demo: false,
    logo: 'data:image/png;base64,' + image,
    contact: { ...clinicConfig.contact, whatsapp: '5511000000000' },
    seo: { ...clinicConfig.seo, title: 'Clínica Áurea </script>', domain: 'https://example.org' },
  }
  await page.locator('input[accept=".json,application/json"]').setInputFiles({
    name: 'cliente.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(config)),
  })
  await expect(page.getByRole('status')).toContainText('importada')
  const { files, name } = await download(page, 'Exportar site (.zip)')
  expect(name).toBe('clinica-aurea-site.zip')
  expect(Object.keys(files)).not.toContain('studio.html')
  expect(strFromU8(files['vercel.json'])).toContain('"outputDirectory": "."')
  expect(strFromU8(files['netlify.toml'])).toContain('publish = "."')
  expect(strFromU8(files['index.html'])).toContain('Clínica Áurea &lt;/script&gt;')
  expect(files['images/enviadas/imagem-1.png']).toEqual(new Uint8Array(Buffer.from(image, 'base64')))

  const host = await serveZip(files)
  try {
    await page.addInitScript(() => { window.open = (url) => { document.body.dataset.testWhatsapp = String(url); return null } })
    const failures: string[] = []
    page.on('pageerror', (error) => failures.push(error.message))
    page.on('response', (response) => {
      if (!response.ok() && response.url().startsWith(host.url)) failures.push(response.url())
    })
    await page.goto(host.url)
    await expect(page.getByRole('heading', { name: config.slogan })).toBeVisible()
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://example.org/')
    await expect(page.locator('header .brand img')).toHaveAttribute('src', '/images/enviadas/imagem-1.png')
    await page.getByLabel('Seu nome').fill('Pessoa de teste')
    await page.getByLabel('Período preferencial').selectOption('Tarde')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Continuar pelo WhatsApp' }).click()
    await expect(page.locator('body')).toHaveAttribute('data-test-whatsapp', /wa\.me\/5511000000000\?text=/)
    expect(failures).toEqual([])
  } finally {
    host.stop()
  }
})

test('ZIP de código para Lovable contém o site editável e gera uma build', async ({ page }) => {
  test.setTimeout(45_000)
  await page.goto(studio)
  await page.getByRole('textbox', { name: 'Slogan', exact: true }).fill('Site exportado como código.')
  await page.getByText('Configuração', { exact: true }).click()
  const { files } = await download(page, 'Código para Lovable (.zip)')
  expect(Object.keys(files)).not.toContain('src/studio.tsx')
  expect(strFromU8(files['src/config/clinic.config.ts'])).toContain('Site exportado como código.')
  const directory = await mkdtemp(join(tmpdir(), 'axyron-source-'))
  try {
    for (const [name, content] of Object.entries(files)) {
      const destination = join(directory, name)
      await mkdir(dirname(destination), { recursive: true })
      await writeFile(destination, content)
    }
    await symlink(resolve('node_modules'), join(directory, 'node_modules'), 'junction')
    await run('npm', ['run', 'build'], { cwd: directory })
    expect(await readFile(join(directory, 'dist', 'index.html'), 'utf8')).toContain('Site exportado como código.')
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('Studio portátil abre e exporta um site com a Internet desligada', async ({ page, context }) => {
  const composed = unzipSync(await readFile(studioArchive))
  await context.setOffline(true)
  await page.setViewportSize({ width: 1440, height: 950 })
  await page.setContent(strFromU8(composed['AXYRON Studio.html']))
  await expect(page.frameLocator('iframe').getByRole('heading', { level: 1 })).toBeVisible()
  await page.screenshot({ path: 'artifacts/studio-v2-desktop.png', animations: 'disabled' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('textbox', { name: 'Slogan', exact: true }).fill('Personalizado sem internet.')
  await page.getByRole('button', { name: 'Mobile', exact: true }).click()
  const preview = page.frameLocator('iframe')
  await expect(preview.getByRole('heading', { name: 'Personalizado sem internet.' })).toBeVisible()
  expect(await preview.locator('.hero-photo img').evaluate(async (img: HTMLImageElement) => {
    await img.decode()
    return img.currentSrc.startsWith('data:')
  })).toBe(true)
  await page.screenshot({ path: 'artifacts/studio-v2-mobile.png', fullPage: true, animations: 'disabled' })
  const { files } = await download(page, 'Exportar site (.zip)')
  expect(strFromU8(files['index.html'])).toContain('Personalizado sem internet.')
})
