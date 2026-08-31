import { useState } from 'react'
import { useParams } from 'react-router'

import { Card, CardBody, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { BillTab } from '@/apps/customer/pages/visit/BillTab'
import { MenuTab } from '@/apps/customer/pages/visit/MenuTab'
import { OrdersTab } from '@/apps/customer/pages/visit/OrdersTab'
import { ServiceCallBar } from '@/apps/customer/pages/visit/ServiceCallBar'
import { VISIT_STATUS_LABELS, visitService } from '@/features/visit/visitService'
import { useVisitSession } from '@/features/visit/useVisitSession'
import { useLiveQuery } from '@/hooks/useLiveQuery'
import { cn } from '@/lib/cn'
import { formatDuration, minutesLeft } from '@/lib/format'

const TABS = [
  { key: 'menu', label: 'เมนู' },
  { key: 'orders', label: 'ออเดอร์' },
  { key: 'bill', label: 'บิล' },
] as const

type TabKey = (typeof TABS)[number]['key']

export function VisitPage() {
  const { token = '' } = useParams()
  const [tab, setTab] = useState<TabKey>('menu')
  const session = useVisitSession(token)

  const visit = useLiveQuery(
    () => visitService.getById(session.visitId as string),
    { tables: ['visits'], enabled: Boolean(session.visitId) },
    [session.visitId],
  )

  if (session.isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Spinner />
        <p className="text-sm text-slate-500">กำลังเปิดโต๊ะของคุณ…</p>
      </div>
    )
  }

  if (session.error) {
    return (
      <Card>
        <CardTitle>เข้าโต๊ะไม่สำเร็จ</CardTitle>
        <CardBody>{session.error.message}</CardBody>
      </Card>
    )
  }

  const data = visit.data
  const remaining = minutesLeft(data?.expires_at ?? null)

  return (
    <div className="space-y-4 pb-24">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">โต๊ะ</p>
            <p className="text-2xl font-bold text-slate-900">
              {data?.dining_tables?.code ?? '—'}
            </p>
            <p className="text-xs text-slate-500">
              {data?.code} · {data?.buffet_packages?.name}
            </p>
          </div>
          <div className="text-right">
            <Badge className="bg-brand-50 text-brand-700">
              {data ? VISIT_STATUS_LABELS[data.status] : '—'}
            </Badge>
            {remaining !== null && (
              <p
                className={cn(
                  'mt-2 text-sm font-medium',
                  remaining <= 10 ? 'text-rose-600' : 'text-slate-600',
                )}
              >
                {remaining > 0 ? `เหลือ ${formatDuration(remaining)}` : 'หมดเวลาแล้ว'}
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
              tab === item.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {session.visitId && (
        <>
          {tab === 'menu' && (
            <MenuTab visitId={session.visitId} canOrder={data?.status === 'open'} />
          )}
          {tab === 'orders' && <OrdersTab visitId={session.visitId} />}
          {tab === 'bill' && <BillTab visitId={session.visitId} visit={data ?? null} />}

          <ServiceCallBar visitId={session.visitId} />
        </>
      )}
    </div>
  )
}
