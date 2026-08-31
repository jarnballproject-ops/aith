import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export type QueueTicket = Tables<'queue_tickets'>
export type QueueStatus = QueueTicket['status']

export const QUEUE_STATUS_LABELS: Record<QueueStatus, string> = {
  waiting: 'รอเรียก',
  called: 'เรียกแล้ว',
  seated: 'ได้โต๊ะแล้ว',
  cancelled: 'ยกเลิก',
  no_show: 'ไม่มาตามคิว',
}

export const queueService = {
  /** ลูกค้ากดรับคิวได้โดยไม่ต้อง login — เก็บ claim_token ไว้เปิดดูสถานะทีหลัง */
  async takeTicket(partySize: number, name?: string, phone?: string) {
    const { data, error } = await supabase.rpc('take_queue_ticket', {
      p_party_size: partySize,
      p_name: name,
      p_phone: phone,
    })
    if (error) throw error
    return data
  },

  async ticketByToken(token: string) {
    const { data, error } = await supabase.rpc('queue_ticket_by_token', { p_token: token })
    if (error) throw error
    return data.at(0) ?? null
  },

  /** บอร์ดคิวหน้าร้าน — ไม่มีข้อมูลส่วนตัวของลูกค้า */
  async board() {
    const { data, error } = await supabase.rpc('queue_board')
    if (error) throw error
    return data
  },

  /** ฝั่งพนักงาน เห็นชื่อและเบอร์โทรด้วย */
  async listForStaff(): Promise<QueueTicket[]> {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
    const { data, error } = await supabase
      .from('queue_tickets')
      .select('*')
      .eq('service_date', today)
      .in('status', ['waiting', 'called'])
      .order('created_at')
    if (error) throw error
    return data
  },

  async call(id: string) {
    const { data, error } = await supabase
      .from('queue_tickets')
      .update({ status: 'called', called_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async setStatus(id: string, status: QueueStatus) {
    const { data, error } = await supabase
      .from('queue_tickets')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}
