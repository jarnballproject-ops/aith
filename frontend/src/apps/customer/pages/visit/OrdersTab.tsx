import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, orderService } from '@/features/order/orderService'
import { useLiveQuery } from '@/hooks/useLiveQuery'
import { formatClock } from '@/lib/format'

export function OrdersTab({ visitId }: { visitId: string }) {
  const orders = useLiveQuery(
    () => orderService.listByVisit(visitId),
    { tables: ['orders', 'order_items'] },
    [visitId],
  )

  if (orders.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    )
  }

  if (!orders.data?.length) {
    return (
      <Card>
        <CardTitle>ยังไม่มีออเดอร์</CardTitle>
        <CardBody>เลือกอาหารจากแท็บเมนูแล้วกดส่งออเดอร์ได้เลย</CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {orders.data.map((order) => (
        <Card key={order.id}>
          <div className="flex items-center justify-between">
            <CardTitle>รอบที่ {order.round_no}</CardTitle>
            <span className="text-xs text-slate-500">{formatClock(order.created_at)}</span>
          </div>

          <ul className="mt-3 space-y-2">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate text-slate-800">
                  {item.name_snapshot} × {item.qty}
                </span>
                <Badge className={ORDER_STATUS_STYLES[item.status]}>
                  {ORDER_STATUS_LABELS[item.status]}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  )
}
