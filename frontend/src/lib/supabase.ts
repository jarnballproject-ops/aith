import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  throw new Error(
    'ไม่พบ VITE_SUPABASE_URL หรือ VITE_SUPABASE_PUBLISHABLE_KEY — คัดลอก .env.example เป็น .env แล้วใส่ค่าให้ครบ',
  )
}

/** เปิดเผยไว้ให้ส่วนอื่นเรียกใช้ได้ — คีย์ฝั่ง client ไม่ใช่ความลับ */
export const SUPABASE_URL: string = url
export const SUPABASE_KEY: string = key

/**
 * client เดียวใช้ทั้งแอป — สร้างหลายตัวจะทำให้ session ชนกัน
 * ความปลอดภัยของข้อมูลมาจาก Row Level Security ที่ตั้งไว้ในฐานข้อมูลเท่านั้น
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * เช็คว่าต่อถึงโปรเจ็คจริงหรือไม่
 * ใช้ /auth/v1/health เพราะเป็น endpoint ที่คีย์ฝั่ง client เรียกได้โดยไม่ต้องมีตารางใด ๆ
 * (/rest/v1/ ต้องใช้ secret key จึงเช็คจาก browser ไม่ได้)
 */
export async function pingSupabase(): Promise<{ ok: boolean; status: number }> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
    headers: { apikey: SUPABASE_KEY },
  })
  return { ok: response.ok, status: response.status }
}
