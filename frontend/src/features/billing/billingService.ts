import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export type Bill = Tables<'bills'>
export type Payment = Tables<'payments'>
export type PaymentMethod = Payment['method']

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'เงินสด',
  promptpay: 'พร้อมเพย์',
  card: 'บัตร',
  transfer: 'โอนเงิน',
}

export const billingService = {
  /** คิดยอดใหม่ทุกครั้งที่เรียก — ลูกค้าสั่งเพิ่มหลังเปิดบิลได้ ยอดจึงต้องอัปเดตตาม */
  async issue(visitId: string) {
    const { data, error } = await supabase.rpc('issue_bill', { p_visit_id: visitId })
    if (error) throw error
    return data
  },

  async getByVisit(visitId: string): Promise<Bill | null> {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('visit_id', visitId)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async pay(billId: string, method: PaymentMethod, amount: number, ref?: string) {
    const { data, error } = await supabase.rpc('pay_bill', {
      p_bill_id: billId,
      p_method: method,
      p_amount: amount,
      p_ref: ref,
    })
    if (error) throw error
    return data
  },

  async salesToday() {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const { data, error } = await supabase
      .from('bills')
      .select('total, issued_at, status')
      .eq('status', 'paid')
      .gte('issued_at', startOfDay.toISOString())
    if (error) throw error
    return data
  },
}
