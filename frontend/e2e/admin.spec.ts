import { expect, test, type Page } from '@playwright/test'

import { storageStatePath } from './fixtures/accounts'

// ใช้เมนูที่ไม่มีเทสต์อื่นแตะ และชื่อไม่เป็นสตริงย่อยของเมนูอื่น
const TOGGLE_ITEM = 'เบคอน'

const menuRow = (page: Page, name: string) =>
  page.getByRole('listitem').filter({ hasText: name }).first()

test.describe('หลังบ้าน — เจ้าของร้าน', () => {
  test.use({ storageState: storageStatePath('owner') })

  test('ภาพรวมยอดขายเปิดได้', async ({ page }) => {
    await page.goto('/admin')

    await expect(page.getByRole('heading', { name: 'ภาพรวมวันนี้' })).toBeVisible()
    for (const label of ['ยอดขาย', 'บิลที่ปิดแล้ว', 'บิลเฉลี่ย', 'จำนวนโต๊ะ', 'จำนวนลูกค้า']) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }
  })

  test.describe('จัดการเมนู', () => {
    // ถ้าเทสต์ล้มกลางคัน เมนูจะค้างเป็นปิดขายและทำให้เทสต์อื่นหาเมนูไม่เจอ
    test.afterEach(async ({ page }) => {
      const row = menuRow(page, TOGGLE_ITEM)
      const restore = row.getByRole('button', { name: 'เปิดขาย' })
      if (await restore.isVisible().catch(() => false)) {
        await restore.click()
        await expect(row.getByRole('button', { name: 'ปิดขาย' })).toBeVisible({ timeout: 15_000 })
      }
    })

    test('กดปิดขายแล้วสถานะเปลี่ยนเองโดยไม่ต้องรีเฟรช', async ({ page }) => {
      await page.goto('/admin/menu')
      await expect(page.getByRole('heading', { name: 'จัดการเมนู' })).toBeVisible()

      const row = menuRow(page, TOGGLE_ITEM)

      // ปุ่มบอก "การกระทำ" ส่วน badge บอก "สถานะ" — ทั้งคู่ต้องพลิกพร้อมกัน
      await expect(row.getByRole('button', { name: 'ปิดขาย' })).toBeVisible()
      await expect(row.locator('span').filter({ hasText: 'เปิดขาย' })).toBeVisible()

      await row.getByRole('button', { name: 'ปิดขาย' }).click()

      // ต้องอัปเดตจาก realtime ไม่ใช่จาก optimistic update ในหน้าจอ
      await expect(row.getByRole('button', { name: 'เปิดขาย' })).toBeVisible({ timeout: 15_000 })
      await expect(row.locator('span').filter({ hasText: 'ปิดขาย' })).toBeVisible()
    })

    test('เมนูที่ปิดขายหายไปจากเมนูฝั่งลูกค้า', async ({ page, context }) => {
      await page.goto('/admin/menu')
      const row = menuRow(page, TOGGLE_ITEM)
      await row.getByRole('button', { name: 'ปิดขาย' }).click()
      await expect(row.getByRole('button', { name: 'เปิดขาย' })).toBeVisible({ timeout: 15_000 })

      const guest = await context.browser()!.newContext()
      const guestPage = await guest.newPage()
      await guestPage.goto('/')
      await expect(guestPage.getByRole('heading', { name: 'ยินดีต้อนรับ' })).toBeVisible()
      await expect(guestPage.getByText(TOGGLE_ITEM)).toBeHidden()
      await guest.close()
    })
  })
})

test.describe('หลังบ้าน — สิทธิ์พนักงาน', () => {
  test.use({ storageState: storageStatePath('staff') })

  test('พนักงานธรรมดาเข้าหลังบ้านไม่ได้', async ({ page }) => {
    await page.goto('/admin')

    await expect(page.getByText('เข้าถึงไม่ได้')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('heading', { name: 'ภาพรวมวันนี้' })).toBeHidden()
  })

  test('แต่ยังเข้าหน้าพนักงานได้ตามปกติ', async ({ page }) => {
    await page.goto('/staff')

    await expect(page.getByRole('heading', { name: 'ภาพรวมร้าน' })).toBeVisible({ timeout: 15_000 })
  })
})
