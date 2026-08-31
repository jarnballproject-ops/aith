import { Link } from 'react-router'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import {
  SERVICE_CALL_LABELS,
  orderService,
  type ServiceCall,
} from '@/features/order/orderService'
import { supabase } from '@/lib/supabase'
import { useLiveQuery } from '@/hooks/useLiveQuery'
import { formatBaht, formatDuration, minutesSince } from '@/lib/format'

async function fetchDashboard() {
  const { data, error } = await supabase.rpc('staff_dashboard')
  if (error) throw error
  return data.at(0) ?? null
}

const WATCHED_TABLES = [
  'queue_tickets',
  'dining_tables',
  'visits',
  'order_items',
  'service_calls',
  'bills',
]

function StatTile({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={tone ?? 'text-slate-900'}>
        <span className="text-3xl font-bold">{value}</span>
      </p>
    </Card>
  )
}

export function DashboardPage() {
  const stats = useLiveQuery(fetchDashboard, { tables: WATCHED_TABLES })
  const calls = useLiveQuery(() => orderService.listOpenCalls(), { tables: ['service_calls'] })

  if (stats.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (stats.error) {
    return <p className="text-rose-600">โหลดแดชบอร์ดไม่สำเร็จ: {stats.error.message}</p>
  }

  const data = stats.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ภาพรวมร้าน</h1>
        <p className="text-sm text-slate-500">อัปเดตอัตโนมัติแบบเรียลไทม์</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <StatTile label="คิวรอ" value={String(data?.waiting_queue ?? 0)} />
        <StatTile label="โต๊ะว่าง" value={String(data?.free_tables ?? 0)} tone="text-emerald-700" />
        <StatTile label="กำลังกิน" value={String(data?.dining_visits ?? 0)} tone="text-amber-700" />
        <StatTile label="รอเสิร์ฟ" value={String(data?.pending_items ?? 0)} tone="text-sky-700" />
        <StatTile label="เรียกพนักงาน" value={String(data?.open_calls ?? 0)} tone="text-rose-700" />
        <StatTile label="ยอดขายวันนี้" value={formatBaht(data?.sales_today ?? 0)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>ลูกค้าเรียกพนักงาน</CardTitle>
            <Badge className="bg-rose-100 text-rose-700">{calls.data?.length ?? 0}</Badge>
          </div>

          <ul className="mt-3 space-y-2">
            {calls.data?.map((call: ServiceCall & { dining_tables: { code: string } | null }) => (
              <li
                key={call.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    โต๊ะ {call.dining_tables?.code ?? '—'} · {SERVICE_CALL_LABELS[call.type]}
                  </p>
                  <p className="text-xs text-slate-500">
                    รอมาแล้ว {formatDuration(minutesSince(call.created_at))}
                  </p>
                </div>
                <div className="flex gap-2">
                  {call.status === 'open' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void orderService.resolveCall(call.id, 'accepted')}
                    >
                      รับงาน
                    </Button>
                  )}
                  <Button size="sm" onClick={() => void orderService.resolveCall(call.id, 'done')}>
                    เสร็จแล้ว
                  </Button>
                </div>
              </li>
            ))}
            {calls.data?.length === 0 && (
              <li className="py-4 text-center text-sm text-slate-500">ไม่มีคำขอค้างอยู่</li>
            )}
          </ul>
        </Card>

        <Card>
          <CardTitle>ทางลัด</CardTitle>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/staff/queue">
              <Button variant="secondary" className="w-full">
                จัดการคิว
              </Button>
            </Link>
            <Link to="/staff/tables">
              <Button variant="secondary" className="w-full">
                ผังโต๊ะ
              </Button>
            </Link>
            <Link to="/staff/kitchen">
              <Button variant="secondary" className="w-full">
                จอครัว
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="secondary" className="w-full">
                หลังบ้าน
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
