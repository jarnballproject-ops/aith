import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173'

export default defineConfig({
  testDir: './e2e',
  // เทสต์ยิงไปที่ Supabase จริง หลายไฟล์แย่งโต๊ะกันเองได้ จึงรันทีละไฟล์
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL,
    locale: 'th-TH',
    timezoneId: 'Asia/Bangkok',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    {
      name: 'desktop',
      testIgnore: [/auth\.setup\.ts/, /cleanup\.spec\.ts/],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 860 } },
      dependencies: ['setup'],
      teardown: 'cleanup',
    },
    {
      // หน้าลูกค้าออกแบบมาเพื่อมือถือ ต้องเทสต์ที่ความกว้างจริง
      name: 'mobile',
      testMatch: /customer\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
      dependencies: ['setup'],
    },

    { name: 'cleanup', testMatch: /cleanup\.spec\.ts/ },
  ],

  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
