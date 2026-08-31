import { expect, test as setup } from '@playwright/test'

import { ACCOUNTS, storageStatePath, type AccountKey } from './fixtures/accounts'

/**
 * ล็อกอินหนึ่งครั้งต่อ role แล้วเก็บ session ไว้เป็นไฟล์
 * เทสต์อื่นหยิบไฟล์นี้ไปใช้เลย ไม่ต้องกรอกฟอร์มซ้ำทุกไฟล์
 */
for (const key of Object.keys(ACCOUNTS) as AccountKey[]) {
  setup(`login as ${key}`, async ({ page }) => {
    const account = ACCOUNTS[key]

    await page.goto('/staff')
    await page.getByLabel('อีเมล').fill(account.email)
    await page.getByLabel('รหัสผ่าน').fill(account.password)
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()

    // แดชบอร์ดขึ้นแปลว่า session ใช้ได้จริง ไม่ใช่แค่ POST ผ่าน
    await expect(page.getByRole('heading', { name: 'ภาพรวมร้าน' })).toBeVisible({ timeout: 15_000 })

    await page.context().storageState({ path: storageStatePath(key) })
  })
}
