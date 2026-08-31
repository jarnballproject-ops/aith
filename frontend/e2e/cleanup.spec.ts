import { test } from '@playwright/test'

import { ACCOUNTS, E2E_MARKER } from './fixtures/accounts'

// เทสต์ยิงไปที่ Supabase จริง จึงต้องเก็บกวาดแถวที่สร้างไว้เอง
// ไม่งั้นคิวกับโต๊ะที่ค้างจะไปโผล่บนแดชบอร์ดของจริง
process.loadEnvFile('.env')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!

test('ล้างข้อมูลที่เทสต์สร้างไว้', async () => {
  const auth = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(ACCOUNTS.owner),
  }).then((response) => response.json())

  if (!auth.access_token) {
    throw new Error(`ล็อกอินเพื่อเก็บกวาดไม่สำเร็จ: ${JSON.stringify(auth)}`)
  }

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${auth.access_token}`,
    'Content-Type': 'application/json',
  }

  const rest = (path: string, init?: RequestInit) =>
    fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers })

  const tickets: { id: string }[] = await rest(
    `queue_tickets?contact_name=eq.${encodeURIComponent(E2E_MARKER)}&select=id`,
  ).then((response) => response.json())

  if (tickets.length === 0) {
    console.log('ไม่มีข้อมูลค้างจากเทสต์')
    return
  }

  const ticketIds = tickets.map((ticket) => ticket.id).join(',')

  // เก็บ table_id ไว้ก่อนลบ visit จะได้คืนสถานะเฉพาะโต๊ะที่เทสต์ยึดไปเท่านั้น
  const visits: { id: string; table_id: string | null }[] = await rest(
    `visits?queue_ticket_id=in.(${ticketIds})&select=id,table_id`,
  ).then((response) => response.json())

  await rest(`visits?queue_ticket_id=in.(${ticketIds})`, { method: 'DELETE' })
  await rest(`queue_tickets?id=in.(${ticketIds})`, { method: 'DELETE' })

  const tableIds = visits.map((visit) => visit.table_id).filter(Boolean)
  if (tableIds.length > 0) {
    await rest(`dining_tables?id=in.(${tableIds.join(',')})`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'available', updated_at: new Date().toISOString() }),
    })
  }

  console.log(`ลบคิว ${tickets.length} · visit ${visits.length} · คืนโต๊ะ ${tableIds.length}`)
})
