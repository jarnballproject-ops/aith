import { expect, test } from '@playwright/test'

import { E2E_MARKER } from './fixtures/accounts'

// ฝั่งลูกค้าไม่ต้อง login — ล้าง session ที่ setup เก็บไว้ทิ้งก่อน
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('ลูกค้า', () => {
  test('หน้าแรกแสดงฟอร์มรับคิวและแพ็กเกจ', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'ยินดีต้อนรับ' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'รับคิว' })).toBeVisible()
    await expect(page.getByLabel('จำนวนคน')).toHaveValue('2')

    // แพ็กเกจต้องโหลดมาจากฐานข้อมูลจริง ไม่ใช่ข้อความ hardcode
    await expect(page.getByText('บุฟเฟต์หมูกระทะ')).toBeVisible()
    await expect(page.getByText('฿199')).toBeVisible()
  })

  test('เนื้อหาไม่ล้นจอมือถือ', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'ยินดีต้อนรับ' })).toBeVisible()

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('กดรับคิวแล้วได้เลขคิวและเห็นคิวตัวเองบนบอร์ด', async ({ page }) => {
    await page.goto('/')

    await page.getByLabel('จำนวนคน').fill('3')
    await page.getByLabel('ชื่อ (ไม่บังคับ)').fill(E2E_MARKER)
    await page.getByRole('button', { name: 'รับคิว' }).click()

    // เด้งไปหน้าคิวพร้อม claim token ใน URL
    await page.waitForURL(/\/q\/[0-9a-f]{32}/, { timeout: 15_000 })

    await expect(page.getByText('หมายเลขคิวของคุณ')).toBeVisible()
    const ticketNo = await page.locator('p.text-6xl').innerText()
    expect(ticketNo).toMatch(/^A\d{3}$/)

    await expect(page.getByText('3 คน', { exact: false })).toBeVisible()

    // ย้อนกลับไปหน้าแรก คิวที่เพิ่งรับต้องโผล่บนบอร์ด
    await page.goto('/')
    await expect(page.getByText(`${ticketNo} · 3 คน`)).toBeVisible({ timeout: 15_000 })
  })

  test('QR ที่ไม่ถูกต้องขึ้นข้อความบอกสาเหตุ ไม่ใช่จอขาว', async ({ page }) => {
    await page.goto('/t/ไม่มีอยู่จริง')

    await expect(page.getByText('เข้าโต๊ะไม่สำเร็จ')).toBeVisible({ timeout: 20_000 })
  })
})
