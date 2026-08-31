import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

/** บัญชีทดสอบที่สร้างไว้ในฐานข้อมูล — ดูตารางเต็มใน README ของ repo */
export const ACCOUNTS = {
  owner: { email: 'admin@puppa.test', password: 'puppa-admin-1234' },
  staff: { email: 'staff@puppa.test', password: 'puppa-staff-1234' },
} as const

export type AccountKey = keyof typeof ACCOUNTS

export const storageStatePath = (key: AccountKey) => path.join(here, '..', '.auth', `${key}.json`)

/** ชื่อที่ใช้ตอนกดรับคิวในเทสต์ — teardown ใช้ค่านี้หาแถวที่ต้องลบ */
export const E2E_MARKER = 'E2E'
