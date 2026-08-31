import { expect, test } from '@playwright/test'

import { E2E_MARKER, storageStatePath } from './fixtures/accounts'

test.use({ storageState: storageStatePath('owner') })

test.describe('พนักงาน', () => {
  test('แดชบอร์ดแสดงตัวเลขครบทั้ง 6 ช่อง', async ({ page }) => {
    await page.goto('/staff')

    await expect(page.getByRole('heading', { name: 'ภาพรวมร้าน' })).toBeVisible()
    for (const label of ['คิวรอ', 'โต๊ะว่าง', 'กำลังกิน', 'รอเสิร์ฟ', 'เรียกพนักงาน', 'ยอดขายวันนี้']) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }
  })

  test('ผังโต๊ะโหลดโต๊ะจากฐานข้อมูล', async ({ page }) => {
    await page.goto('/staff/tables')

    await expect(page.getByRole('heading', { name: 'ผังโต๊ะ' })).toBeVisible()
    await expect(page.getByRole('button', { name: /^A01/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^C02/ })).toBeVisible()
  })

  test('จอครัวเปิดได้และสลับ station ได้', async ({ page }) => {
    await page.goto('/staff/kitchen')

    await expect(page.getByRole('heading', { name: 'จอครัว' })).toBeVisible()
    await page.getByRole('button', { name: 'เตา', exact: true }).click()
    await expect(page.getByRole('button', { name: 'เตา', exact: true })).toBeVisible()
  })

  // เส้นทางหลักของทั้งระบบ: คิว → โต๊ะ → Visit → QR → ออเดอร์ → ครัว
  test('รับคิว แล้วเปิดโต๊ะ สั่งอาหาร และเห็นในครัว', async ({ page, context }) => {
    // ลูกค้ากดรับคิวจากอีกแท็บที่ยังไม่ได้ login
    const guest = await context.browser()!.newContext()
    const guestPage = await guest.newPage()
    await guestPage.goto('/')
    await guestPage.getByLabel('จำนวนคน').fill('4')
    await guestPage.getByLabel('ชื่อ (ไม่บังคับ)').fill(E2E_MARKER)
    await guestPage.getByRole('button', { name: 'รับคิว' }).click()
    await guestPage.waitForURL(/\/q\//, { timeout: 15_000 })
    const ticketNo = await guestPage.locator('p.text-6xl').innerText()

    // พนักงานเห็นคิวนั้นแบบเรียลไทม์ แล้วกดจัดโต๊ะ
    await page.goto('/staff/queue')
    const row = page.locator('li').filter({ hasText: ticketNo })
    await expect(row).toBeVisible({ timeout: 15_000 })

    await row.getByRole('button', { name: 'จัดโต๊ะ' }).click()
    await expect(page.getByText('แนะนำ:')).toBeVisible()

    await page.getByRole('button', { name: 'เปิดโต๊ะและสร้าง QR' }).click()

    // ได้ QR ประจำโต๊ะออกมา
    const qr = page.getByRole('img', { name: /^QR สำหรับ/ })
    await expect(qr).toBeVisible({ timeout: 15_000 })
    const qrAlt = (await qr.getAttribute('alt')) ?? ''
    const visitUrl = qrAlt.replace('QR สำหรับ ', '')
    expect(visitUrl).toContain('/t/')

    // ลูกค้าสแกน QR แล้วสั่งอาหาร (พนักงานสั่งแทนได้ ไม่ต้องพึ่ง anonymous auth)
    await page.goto(new URL(visitUrl).pathname)
    await expect(page.getByRole('button', { name: 'เมนู' })).toBeVisible({ timeout: 20_000 })

    await page.getByRole('button', { name: 'เพิ่ม หมูสไลซ์' }).click()
    await page.getByRole('button', { name: 'เพิ่ม หมูสไลซ์' }).click()
    await page.getByRole('button', { name: 'ส่งออเดอร์' }).click()
    await expect(page.getByText(/ส่งออเดอร์รอบที่ \d+ ให้ครัวแล้ว/)).toBeVisible({ timeout: 15_000 })

    // ออเดอร์ต้องเด้งขึ้นจอครัวเองโดยไม่ต้องรีเฟรช
    await page.goto('/staff/kitchen')
    const ticket = page.getByText('หมูสไลซ์').first()
    await expect(ticket).toBeVisible({ timeout: 20_000 })

    await guest.close()
  })
})
