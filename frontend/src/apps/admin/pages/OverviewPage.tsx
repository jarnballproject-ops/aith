import { Card, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { supabase } from '@/lib/supabase'
import { useLiveQuery } from '@/hooks/useLiveQuery'
import { formatBaht } from '@/lib/format'

interface TopItem {
  name: string
  qty: number
  revenue: number
}

/**
 * สรุปยอดขายวันนี้จากบิลที่ชำระแล้ว + รายการที่ขายดีที่สุด
 * ตอนนี้คำนวณฝั่ง client เพราะข้อมูลต่อวันยังน้อย — ถ้าโตขึ้นค่อยย้ายไปเป็น view ในฐานข้อมูล
 */
async function fetchOverview() {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const since = startOfDay.toISOString()

  const [bills, visits, items] = await Promise.all([
    supabase.from('bills').select('total, status').eq('status', 'paid').gte('issued_at', since),
    supabase.from('visits').select('id, adults, children').gte('opened_at', since),
    supabase
      .from('order_items')
      .select('name_snapshot, qty, unit_price, status, created_at')
      .neq('status', 'cancelled')
      .gte('created_at', since),
  ])

  if (bills.error) throw bills.error
  if (visits.error) throw visits.error
  if (items.error) throw items.error

  const sales = bills.data.reduce((sum, bill) => sum + bill.total, 0)
  const guests = visits.data.reduce((sum, visit) => sum + visit.adults + visit.children, 0)

  const byName = new Map<string, TopItem>()
  for (const item of items.data) {
    const current = byName.get(item.name_snapshot) ?? { name: item.name_snapshot, qty: 0, revenue: 0 }
    current.qty += item.qty
    current.revenue += item.qty * item.unit_price
    byName.set(item.name_snapshot, current)
  }

  return {
    sales,
    guests,
    visitCount: visits.data.length,
    billCount: bills.data.length,
    averageBill: bills.data.length > 0 ? sales / bills.data.length : 0,
    topItems: [...byName.values()].sort((a, b) => b.qty - a.qty).slice(0, 10),
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </Card>
  )
}

export function OverviewPage() {
  const overview = useLiveQuery(fetchOverview, { tables: ['bills', 'visits', 'order_items'] })

  if (overview.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (overview.error) {
    return <p className="text-rose-600">โหลดข้อมูลไม่สำเร็จ: {overview.error.message}</p>
  }

  const data = overview.data!

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ภาพรวมวันนี้</h1>
        <p className="text-sm text-slate-500">นับจากเที่ยงคืนถึงตอนนี้</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="ยอดขาย" value={formatBaht(data.sales)} />
        <Stat label="บิลที่ปิดแล้ว" value={String(data.billCount)} />
        <Stat label="บิลเฉลี่ย" value={formatBaht(data.averageBill)} />
        <Stat label="จำนวนโต๊ะ" value={String(data.visitCount)} />
        <Stat label="จำนวนลูกค้า" value={String(data.guests)} />
      </div>

      <Card>
        <CardTitle>เมนูขายดีวันนี้</CardTitle>
        {data.topItems.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">ยังไม่มีออเดอร์วันนี้</p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th className="pb-2 font-medium">เมนู</th>
                <th className="pb-2 text-right font-medium">จำนวน</th>
                <th className="pb-2 text-right font-medium">รายได้</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.topItems.map((item) => (
                <tr key={item.name}>
                  <td className="py-2 text-slate-800">{item.name}</td>
                  <td className="py-2 text-right text-slate-900">{item.qty}</td>
                  <td className="py-2 text-right text-slate-600">
                    {item.revenue > 0 ? formatBaht(item.revenue) : 'รวมในบุฟเฟต์'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
