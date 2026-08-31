import { supabase } from '@/lib/supabase'
import type { Json, Tables } from '@/types/database.types'

export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type OrderStatus = OrderItem['status']
export type PrepStation = OrderItem['station']
export type ServiceCall = Tables<'service_calls'>
export type ServiceCallType = ServiceCall['type']

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

export interface KitchenTicket extends OrderItem {
  orders: {
    id: string
    round_no: number
    visit_id: string
    visits: { code: string; dining_tables: { code: string } | null } | null
  } | null
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'รอรับออเดอร์',
  accepted: 'รับออเดอร์แล้ว',
  preparing: 'กำลังเตรียม',
  ready: 'พร้อมเสิร์ฟ',
  served: 'เสิร์ฟแล้ว',
  cancelled: 'ยกเลิก',
}

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-slate-100 text-slate-700',
  accepted: 'bg-sky-100 text-sky-800',
  preparing: 'bg-amber-100 text-amber-900',
  ready: 'bg-emerald-100 text-emerald-800',
  served: 'bg-slate-100 text-slate-500',
  cancelled: 'bg-rose-100 text-rose-700',
}

export const STATION_LABELS: Record<PrepStation, string> = {
  kitchen: 'ครัว',
  grill: 'เตา',
  drink: 'เครื่องดื่ม',
  dessert: 'ของหวาน',
}

export const SERVICE_CALL_LABELS: Record<ServiceCallType, string> = {
  staff: 'เรียกพนักงาน',
  water: 'ขอเติมน้ำ',
  utensils: 'ขอจาน/อุปกรณ์',
  charcoal: 'เปลี่ยนเตา/ถ่าน',
  bill: 'ขอเช็กบิล',
  problem: 'แจ้งปัญหา',
}

/** ลำดับการไหลของสถานะ ใช้กับปุ่ม "ขั้นถัดไป" ในหน้าครัว */
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'accepted',
  accepted: 'preparing',
  preparing: 'ready',
  ready: 'served',
}

export interface CartLine {
  menu_item_id: string
  qty: number
  note?: string
}

export const orderService = {
  async place(visitId: string, items: CartLine[], note?: string) {
    const { data, error } = await supabase.rpc('place_order', {
      p_visit_id: visitId,
      p_items: items as unknown as Json,
      p_note: note,
    })
    if (error) throw error
    return data
  },

  async listByVisit(visitId: string): Promise<OrderWithItems[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('visit_id', visitId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as OrderWithItems[]
  },

  /** คิวครัว — เรียงจากรายการที่ค้างนานที่สุดขึ้นก่อน */
  async kitchenQueue(station?: PrepStation): Promise<KitchenTicket[]> {
    let query = supabase
      .from('order_items')
      .select('*, orders(id, round_no, visit_id, visits(code, dining_tables(code)))')
      .in('status', ['pending', 'accepted', 'preparing', 'ready'])
      .order('created_at')
    if (station) query = query.eq('station', station)

    const { data, error } = await query
    if (error) throw error
    return data as unknown as KitchenTicket[]
  },

  async setItemStatus(itemId: string, status: OrderStatus) {
    const { data, error } = await supabase.rpc('set_order_item_status', {
      p_item_id: itemId,
      p_status: status,
    })
    if (error) throw error
    return data
  },

  async callStaff(visitId: string, type: ServiceCallType, note?: string) {
    const { data, error } = await supabase.rpc('call_staff', {
      p_visit_id: visitId,
      p_type: type,
      p_note: note,
    })
    if (error) throw error
    return data
  },

  async listOpenCalls(): Promise<(ServiceCall & { dining_tables: { code: string } | null })[]> {
    const { data, error } = await supabase
      .from('service_calls')
      .select('*, dining_tables(code)')
      .in('status', ['open', 'accepted'])
      .order('created_at')
    if (error) throw error
    return data as (ServiceCall & { dining_tables: { code: string } | null })[]
  },

  async resolveCall(id: string, status: 'accepted' | 'done') {
    const patch =
      status === 'accepted'
        ? { status, accepted_at: new Date().toISOString() }
        : { status, done_at: new Date().toISOString() }
    const { data, error } = await supabase
      .from('service_calls')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}
