import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export type DiningTable = Tables<'dining_tables'>
export type TableStatus = DiningTable['status']

export const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  available: 'ว่าง',
  reserved: 'จองไว้',
  occupied: 'กำลังกิน',
  billing: 'เรียกเช็กบิล',
  cleaning: 'ทำความสะอาด',
}

export const TABLE_STATUS_STYLES: Record<TableStatus, string> = {
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  reserved: 'bg-sky-50 text-sky-700 border-sky-200',
  occupied: 'bg-amber-50 text-amber-800 border-amber-200',
  billing: 'bg-violet-50 text-violet-700 border-violet-200',
  cleaning: 'bg-slate-100 text-slate-600 border-slate-200',
}

export const tableService = {
  async list(): Promise<DiningTable[]> {
    const { data, error } = await supabase
      .from('dining_tables')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (error) throw error
    return data
  },

  async setStatus(id: string, status: TableStatus) {
    const { data, error } = await supabase
      .from('dining_tables')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  /**
   * แนะนำโต๊ะที่เล็กที่สุดที่ยังนั่งได้ครบ เพื่อไม่ให้กลุ่มเล็กไปกินโต๊ะใหญ่
   * ถ้าไม่มีโต๊ะไหนพอ ให้คืนโต๊ะว่างที่ใหญ่ที่สุดไว้ให้พนักงานตัดสินใจเอง (เช่น รวมโต๊ะ)
   */
  suggestTable(tables: DiningTable[], partySize: number): DiningTable | null {
    const free = tables.filter((table) => table.status === 'available')
    if (free.length === 0) return null

    const fits = free.filter((table) => table.seats >= partySize)
    if (fits.length > 0) {
      return fits.reduce((best, table) => (table.seats < best.seats ? table : best))
    }
    return free.reduce((best, table) => (table.seats > best.seats ? table : best))
  },
}
