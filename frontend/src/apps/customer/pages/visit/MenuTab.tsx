import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { menuService, type MenuItem } from '@/features/menu/menuService'
import { orderService, type CartLine } from '@/features/order/orderService'
import { useLiveQuery } from '@/hooks/useLiveQuery'
import { cn } from '@/lib/cn'
import { formatBaht } from '@/lib/format'

export function MenuTab({ visitId, canOrder }: { visitId: string; canOrder: boolean }) {
  const menu = useLiveQuery(() => menuService.listMenu(), { tables: ['menu_items'] })
  const [cart, setCart] = useState<Record<string, number>>({})
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const itemsById = useMemo(() => {
    const map = new Map<string, MenuItem>()
    for (const section of menu.data ?? []) {
      for (const item of section.items) map.set(item.id, item)
    }
    return map
  }, [menu.data])

  const lines = Object.entries(cart).filter(([, qty]) => qty > 0)
  const totalQty = lines.reduce((sum, [, qty]) => sum + qty, 0)
  const extraCost = lines.reduce(
    (sum, [id, qty]) => sum + (itemsById.get(id)?.price ?? 0) * qty,
    0,
  )

  function changeQty(item: MenuItem, delta: number) {
    setCart((current) => {
      const next = (current[item.id] ?? 0) + delta
      const capped = item.max_per_order ? Math.min(next, item.max_per_order) : next
      return { ...current, [item.id]: Math.max(0, capped) }
    })
  }

  async function submit() {
    setError(null)
    setMessage(null)
    setIsSending(true)
    try {
      const payload: CartLine[] = lines.map(([menu_item_id, qty]) => ({ menu_item_id, qty }))
      const order = await orderService.place(visitId, payload)
      setCart({})
      setMessage(`ส่งออเดอร์รอบที่ ${order.round_no} ให้ครัวแล้ว`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ส่งออเดอร์ไม่สำเร็จ')
    } finally {
      setIsSending(false)
    }
  }

  if (menu.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {message && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>
      )}
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {!canOrder && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          โต๊ะนี้ปิดการสั่งแล้ว หากต้องการสั่งเพิ่มกรุณาเรียกพนักงาน
        </p>
      )}

      {menu.data?.map((section) => (
        <Card key={section.category.id}>
          <CardTitle>{section.category.name}</CardTitle>
          <ul className="mt-3 divide-y divide-slate-100">
            {section.items.map((item) => {
              const qty = cart[item.id] ?? 0
              return (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    {item.description && (
                      <p className="truncate text-xs text-slate-500">{item.description}</p>
                    )}
                    <p className="text-xs text-slate-500">
                      {item.price > 0 ? (
                        <span className="text-brand-700">+{formatBaht(item.price)}</span>
                      ) : (
                        'รวมในบุฟเฟต์'
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`ลด ${item.name}`}
                      disabled={qty === 0 || !canOrder}
                      onClick={() => changeQty(item, -1)}
                      className="size-8 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className={cn('w-5 text-center text-sm', qty === 0 && 'text-slate-400')}>
                      {qty}
                    </span>
                    <button
                      type="button"
                      aria-label={`เพิ่ม ${item.name}`}
                      disabled={!canOrder}
                      onClick={() => changeQty(item, 1)}
                      className="size-8 rounded-lg border border-brand-500 bg-brand-50 text-brand-700 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      ))}

      {totalQty > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-20 px-4">
          <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-white shadow-lg">
            <div className="flex-1 text-sm">
              <p className="font-medium">{totalQty} รายการ</p>
              {extraCost > 0 && (
                <p className="text-xs text-slate-300">คิดเงินเพิ่ม {formatBaht(extraCost)}</p>
              )}
            </div>
            <Button onClick={submit} disabled={isSending || !canOrder}>
              {isSending ? 'กำลังส่ง…' : 'ส่งออเดอร์'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
