import { defineConfig } from '@playwright/test'

const local = 'http://127.0.0.1'
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  workers: 2,
  use: { baseURL: local + ':4180', browserName: 'chromium', launchOptions: { executablePath: process.env.AXYRON_CHROMIUM, args: ['--no-sandbox'] }, trace: 'retain-on-failure' },
  webServer: [
    { command: 'npm run preview -- --host 127.0.0.1 --port 4180 --strictPort', url: local + ':4180', reuseExistingServer: !process.env.CI },
    { command: 'npm run preview:studio -- --host 127.0.0.1 --port 4181 --strictPort', url: local + ':4181/studio.html', reuseExistingServer: !process.env.CI },
  ],
})
