import { useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { menuService, type MenuItem } from '@/features/menu/menuService'
import { STATION_LABELS } from '@/features/order/orderService'
import { useLiveQuery } from '@/hooks/useLiveQuery'
import { formatBaht } from '@/lib/format'

const KIND_LABELS: Record<MenuItem['kind'], string> = {
  buffet: 'รวมในบุฟเฟต์',
  a_la_carte: 'สั่งเพิ่ม',
  addon: 'Add-on',
  drink: 'เครื่องดื่ม',
}

export function MenuManagerPage() {
  const menu = useLiveQuery(() => menuService.listMenu({ availableOnly: false }), {
    tables: ['menu_items', 'menu_categories'],
  })
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function toggle(item: MenuItem) {
    setError(null)
    setBusyId(item.id)
    try {
      await menuService.toggleAvailability(item.id, !item.is_available)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'แก้ไขไม่สำเร็จ')
    } finally {
      setBusyId(null)
    }
  }

  if (menu.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">จัดการเมนู</h1>
        <p className="text-sm text-slate-500">
          ปิดเมนูที่ของหมดได้ทันที ลูกค้าที่เปิดหน้าเมนูอยู่จะเห็นผลทันทีโดยไม่ต้องรีเฟรช
        </p>
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {menu.data?.map((section) => (
        <Card key={section.category.id}>
          <CardTitle>{section.category.name}</CardTitle>
          <ul className="mt-3 divide-y divide-slate-100">
            {section.items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {KIND_LABELS[item.kind]} · {STATION_LABELS[item.station]}
                    {item.max_per_order && ` · สูงสุด ${item.max_per_order}/ครั้ง`}
                  </p>
                </div>

                <span className="text-sm text-slate-700">
                  {item.price > 0 ? formatBaht(item.price) : '—'}
                </span>

                <Badge
                  className={
                    item.is_available
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }
                >
                  {item.is_available ? 'เปิดขาย' : 'ปิดขาย'}
                </Badge>

                <Button
                  size="sm"
                  variant={item.is_available ? 'ghost' : 'primary'}
                  disabled={busyId === item.id}
                  onClick={() => void toggle(item)}
                >
                  {item.is_available ? 'ปิดขาย' : 'เปิดขาย'}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  )
}
