import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { presets } from '../src/config/presets'
import { clinicConfig } from '../src/config/clinic.config'

test('Studio altera a prévia, valida importação, exporta JSON e restaura o padrão', async ({ page }) => {
  await page.goto('http://127.0.0.1:4181/studio.html')
  await page.getByRole('textbox', { name: 'Slogan', exact: true }).fill('Clínica de teste automatizado')
  const preview = page.frameLocator('iframe')
  await expect(preview.getByRole('heading', { level: 1 })).toHaveAccessibleName('Clínica de teste automatizado')
  for (const [preset, colors] of Object.entries(presets)) {
    await page.getByRole('combobox', { name: 'Preset', exact: true }).selectOption(preset)
    await expect.poll(() => preview.locator('.site').evaluate((element) => getComputedStyle(element).getPropertyValue('--dark').trim())).toBe(colors.dark)
  }
  await page.getByRole('button', { name: 'Tablet', exact: true }).click()
  await expect(page.locator('iframe')).toHaveAttribute('width', '768')
  await page.getByRole('button', { name: 'Mobile', exact: true }).click()
  await expect(page.locator('iframe')).toHaveAttribute('width', '390')
  const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jVZcAAAAASUVORK5CYII='
  await page.getByLabel('Enviar logotipo', { exact: true }).setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') })
  await expect(preview.locator('header .brand img')).toHaveAttribute('src', 'data:image/png;base64,' + png)
  await page.getByText('Configuração', { exact: true }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar JSON' }).click()
  const download = await downloadPromise
  const json = await readFile((await download.path())!, 'utf8')
  expect(JSON.parse(json).preset).toBe('Soft Rose')
  expect(JSON.parse(json).logo).toBe('data:image/png;base64,' + png)
  await page.getByRole('button', { name: 'Restaurar padrão' }).click()
  await expect(page.getByRole('combobox', { name: 'Preset', exact: true })).toHaveValue(clinicConfig.preset)
  const input = page.locator('input[accept=".json,application/json"]')
  await input.setInputFiles({ name: 'invalido.json', mimeType: 'application/json', buffer: Buffer.from('{}') })
  await expect(page.getByRole('status')).toContainText('Falha na importação')
  await input.setInputFiles({ name: 'cliente.json', mimeType: 'application/json', buffer: Buffer.from(json) })
  await expect(page.getByRole('status')).toContainText('Configuração importada')
  await expect(preview.getByRole('heading', { level: 1 })).toHaveAccessibleName('Clínica de teste automatizado')
})

test('Studio permite configurar uma métrica e anima somente os valores preenchidos', async ({ page }) => {
  await page.goto('http://127.0.0.1:4181/studio.html')
  await page.getByRole('button', { name: 'Mobile', exact: true }).click()
  await page.getByText('Métricas da clínica', { exact: true }).click()
  await page.getByRole('button', { name: 'Adicionar métrica' }).click()
  await page.getByText('Métrica 1', { exact: true }).click()
  await page.getByRole('textbox', { name: 'Nome da métrica' }).fill('Sorrisos restaurados')
  await page.getByRole('spinbutton', { name: 'Valor confirmado' }).fill('1280')
  await page.getByRole('textbox', { name: 'Período ou fonte' }).fill('Período de teste')
  const preview = page.frameLocator('iframe')
  const region = preview.getByRole('region', { name: 'O cuidado em números.' })
  await expect(region.locator('dt')).toHaveText(['Sorrisos restaurados'])
  await expect(region.getByText('Período de teste')).toHaveCount(1)
  const readings = await region.evaluate(async (section) => {
    const counter = section.querySelector('.metric-number [aria-hidden]')
    if (!counter) throw new Error('Contador não encontrado')
    return new Promise<string[]>((resolve) => {
      const values: string[] = []
      const observer = new MutationObserver(() => {
        values.push(counter.textContent ?? '')
        if (values.at(-1) === '1.280') finish()
      })
      const timeout = window.setTimeout(finish, 2500)
      function finish() {
        clearTimeout(timeout)
        observer.disconnect()
        resolve(values)
      }
      observer.observe(counter, { childList: true, characterData: true, subtree: true })
      section.scrollIntoView()
    })
  })
  expect(readings.some((value) => Number(value) > 0 && Number(value) < 1280)).toBe(true)
  expect(readings.at(-1)).toBe('1.280')
  await expect(region.locator('.metric-number .sr-only')).toHaveText('1.280')
  await page.getByRole('spinbutton', { name: 'Valor confirmado' }).fill('')
  await expect(region).toHaveCount(0)
})
