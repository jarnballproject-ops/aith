import { useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import {
  NEXT_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  STATION_LABELS,
  orderService,
  type PrepStation,
} from '@/features/order/orderService'
import { useLiveQuery } from '@/hooks/useLiveQuery'
import { cn } from '@/lib/cn'
import { formatDuration, minutesSince } from '@/lib/format'

const STATIONS: (PrepStation | 'all')[] = ['all', 'grill', 'kitchen', 'drink', 'dessert']

/** เกินกี่นาทีถือว่าออเดอร์ค้างนานผิดปกติ */
const LATE_AFTER_MINUTES = 10

export function KitchenPage() {
  const [station, setStation] = useState<PrepStation | 'all'>('all')

  const queue = useLiveQuery(
    () => orderService.kitchenQueue(station === 'all' ? undefined : station),
    { tables: ['order_items', 'orders'] },
    [station],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">จอครัว</h1>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {STATIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStation(value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                station === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600',
              )}
            >
              {value === 'all' ? 'ทั้งหมด' : STATION_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {queue.isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {queue.data?.length === 0 && (
        <Card>
          <p className="py-8 text-center text-slate-500">ไม่มีรายการค้างในครัว</p>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {queue.data?.map((item) => {
          const waited = minutesSince(item.created_at)
          const next = NEXT_STATUS[item.status]

          return (
            <Card
              key={item.id}
              className={cn('p-4', waited >= LATE_AFTER_MINUTES && 'border-rose-300 bg-rose-50/50')}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    โต๊ะ {item.orders?.visits?.dining_tables?.code ?? '—'}
                  </p>
                  <p className="text-xs text-slate-500">
                    รอบที่ {item.orders?.round_no} · {STATION_LABELS[item.station]}
                  </p>
                </div>
                <Badge className={ORDER_STATUS_STYLES[item.status]}>
                  {ORDER_STATUS_LABELS[item.status]}
                </Badge>
              </div>

              <p className="mt-3 text-lg font-medium text-slate-900">
                {item.name_snapshot} <span className="text-brand-700">× {item.qty}</span>
              </p>
              {item.note && <p className="text-xs text-amber-700">หมายเหตุ: {item.note}</p>}

              <p
                className={cn(
                  'mt-1 text-xs',
                  waited >= LATE_AFTER_MINUTES ? 'font-medium text-rose-600' : 'text-slate-500',
                )}
              >
                รอมาแล้ว {formatDuration(waited)}
              </p>

              <div className="mt-3 flex gap-2">
                {next && (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => void orderService.setItemStatus(item.id, next)}
                  >
                    {ORDER_STATUS_LABELS[next]}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void orderService.setItemStatus(item.id, 'cancelled')}
                >
                  ยกเลิก
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
