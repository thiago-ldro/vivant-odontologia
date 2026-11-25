import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'
import { preview } from 'vite'

const host = '127.0.0.1'
const url = 'http://' + host + ':4182/'
const server = await preview({ preview: { host, port: 4182, strictPort: true } })
await mkdir('artifacts', { recursive: true })
try {
  for (const device of ['mobile', 'desktop']) {
    const profile = await mkdtemp(join(tmpdir(), 'axyron-lighthouse-'))
    const browser = spawn(process.env.AXYRON_CHROMIUM || 'chromium', [
      '--headless=new', '--no-sandbox', '--disable-dev-shm-usage',
      '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
    ], { stdio: ['ignore', 'ignore', 'pipe'] })
    try {
      const endpoint = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Chromium não ficou disponível para auditoria.')), 10000)
        browser.once('error', (error) => { clearTimeout(timeout); reject(error) })
        browser.once('exit', () => { clearTimeout(timeout); reject(new Error('Chromium saiu antes de abrir o endpoint.')) })
        browser.stderr.on('data', (chunk) => {
          const match = String(chunk).match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/)
          if (match) { clearTimeout(timeout); resolve(Number(match[1])) }
        })
      })
      const result = await lighthouse(url, { port: endpoint, output: ['html', 'json'], logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] }, device === 'desktop' ? desktopConfig : undefined)
      if (!result || result.lhr.runtimeError) throw new Error(result?.lhr.runtimeError?.message || 'A auditoria não retornou resultados.')
      await writeFile('artifacts/lighthouse-' + device + '.html', result.report[0])
      await writeFile('artifacts/lighthouse-' + device + '.json', result.report[1])
      const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([key, category]) => [key, Math.round((category.score ?? 0) * 100)]))
      process.stdout.write(device + ' ' + JSON.stringify(scores) + '\n')
    } finally {
      if (browser.pid && browser.exitCode === null && browser.signalCode === null) {
        const exited = once(browser, 'exit')
        browser.kill()
        await exited
      }
      await rm(profile, { recursive: true, force: true }).catch(() => {})
    }
  }
} finally {
  await new Promise((resolve) => server.httpServer.close(resolve))
}
