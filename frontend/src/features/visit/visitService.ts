import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export type Visit = Tables<'visits'>
export type VisitStatus = Visit['status']

export interface VisitDetail extends Visit {
  dining_tables: Pick<Tables<'dining_tables'>, 'id' | 'code' | 'zone' | 'seats'> | null
  buffet_packages: Pick<Tables<'buffet_packages'>, 'id' | 'name' | 'minutes' | 'price_adult' | 'price_child'> | null
}

const VISIT_DETAIL_SELECT =
  '*, dining_tables(id, code, zone, seats), buffet_packages(id, name, minutes, price_adult, price_child)'

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  open: 'กำลังกิน',
  billing: 'เรียกเช็กบิล',
  paid: 'ชำระแล้ว',
  closed: 'ปิดโต๊ะแล้ว',
  cancelled: 'ยกเลิก',
}

export const visitService = {
  /** พนักงานเปิดโต๊ะ — คืน visit พร้อม access_token สำหรับทำ QR */
  async open(params: {
    tableId: string
    packageId: string
    adults: number
    children?: number
    ticketId?: string
  }) {
    const { data, error } = await supabase.rpc('open_visit', {
      p_table_id: params.tableId,
      p_package_id: params.packageId,
      p_adults: params.adults,
      p_children: params.children ?? 0,
      p_ticket_id: params.ticketId,
    })
    if (error) throw error
    return data
  },

  /** ลูกค้าสแกน QR แล้วเรียกอันนี้เพื่อผูกตัวเองเข้ากับโต๊ะ */
  async join(token: string) {
    const { data, error } = await supabase.rpc('join_visit', { p_token: token })
    if (error) throw error
    return data
  },

  async getById(id: string): Promise<VisitDetail> {
    const { data, error } = await supabase
      .from('visits')
      .select(VISIT_DETAIL_SELECT)
      .eq('id', id)
      .single()
    if (error) throw error
    return data as unknown as VisitDetail
  },

  async listActive(): Promise<VisitDetail[]> {
    const { data, error } = await supabase
      .from('visits')
      .select(VISIT_DETAIL_SELECT)
      .in('status', ['open', 'billing'])
      .order('opened_at')
    if (error) throw error
    return data as unknown as VisitDetail[]
  },

  async close(id: string) {
    const { data, error } = await supabase.rpc('close_visit', { p_visit_id: id })
    if (error) throw error
    return data
  },

  /** URL ที่จะเอาไปทำ QR ประจำโต๊ะ */
  qrUrl: (accessToken: string) => `${window.location.origin}/t/${accessToken}`,
}
