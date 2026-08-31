import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { billingService } from '@/features/billing/billingService'
import { orderService } from '@/features/order/orderService'
import type { VisitDetail } from '@/features/visit/visitService'
import { useLiveQuery } from '@/hooks/useLiveQuery'
import { formatBaht } from '@/lib/format'

export function BillTab({ visitId, visit }: { visitId: string; visit: VisitDetail | null }) {
  const [isCalling, setIsCalling] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const bill = useLiveQuery(() => billingService.getByVisit(visitId), { tables: ['bills'] }, [visitId])
  const orders = useLiveQuery(
    () => orderService.listByVisit(visitId),
    { tables: ['orders', 'order_items'] },
    [visitId],
  )

  const pkg = visit?.buffet_packages
  const buffetTotal =
    (pkg?.price_adult ?? 0) * (visit?.adults ?? 0) + (pkg?.price_child ?? 0) * (visit?.children ?? 0)

  const extraLines = (orders.data ?? [])
    .flatMap((order) => order.order_items)
    .filter((item) => item.status !== 'cancelled' && item.unit_price > 0)

  const extraTotal = extraLines.reduce((sum, item) => sum + item.unit_price * item.qty, 0)
  const estimated = buffetTotal + extraTotal

  async function requestBill() {
    setIsCalling(true)
    try {
      await orderService.callStaff(visitId, 'bill')
      setMessage('แจ้งพนักงานแล้ว รอสักครู่นะครับ')
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'เรียกเช็กบิลไม่สำเร็จ')
    } finally {
      setIsCalling(false)
    }
  }

  if (orders.isLoading || bill.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardTitle>ยอดที่ต้องชำระ</CardTitle>
        <CardBody className="space-y-3">
          <div className="flex justify-between">
            <span>
              {pkg?.name} — ผู้ใหญ่ {visit?.adults} คน
              {(visit?.children ?? 0) > 0 && `, เด็ก ${visit?.children} คน`}
            </span>
            <span className="whitespace-nowrap">{formatBaht(buffetTotal)}</span>
          </div>

          {extraLines.length > 0 && (
            <div className="space-y-1 border-t border-slate-100 pt-3">
              <p className="text-xs font-medium text-slate-500">รายการคิดเงินเพิ่ม</p>
              {extraLines.map((item) => (
                <div key={item.id} className="flex justify-between text-slate-700">
                  <span>
                    {item.name_snapshot} × {item.qty}
                  </span>
                  <span className="whitespace-nowrap">{formatBaht(item.unit_price * item.qty)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
            <span>รวมทั้งสิ้น</span>
            <span>{formatBaht(bill.data?.total ?? estimated)}</span>
          </div>

          {!bill.data && (
            <p className="text-xs text-slate-500">
              ยอดนี้เป็นการคำนวณเบื้องต้น พนักงานจะออกบิลจริงตอนเช็กบิล
            </p>
          )}
          {bill.data?.status === 'paid' && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              ชำระเงินเรียบร้อยแล้ว ขอบคุณที่มาใช้บริการครับ
            </p>
          )}
        </CardBody>
      </Card>

      {bill.data?.status !== 'paid' && (
        <Button size="lg" className="w-full" onClick={requestBill} disabled={isCalling}>
          เรียกพนักงานเช็กบิล
        </Button>
      )}
      {message && <p className="text-center text-sm text-slate-600">{message}</p>}
    </div>
  )
}
