import { Link, useParams } from 'react-router'

import { Card, CardBody, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { QUEUE_STATUS_LABELS, queueService } from '@/features/queue/queueService'
import { useLiveQuery } from '@/hooks/useLiveQuery'
import { formatClock, formatDuration, minutesSince } from '@/lib/format'

/** ประมาณ 12 นาทีต่อคิว — ปรับได้เมื่อมีข้อมูลเวลารอจริงจาก pilot */
const MINUTES_PER_TICKET = 12

export function QueueTicketPage() {
  const { token = '' } = useParams()
  const ticket = useLiveQuery(() => queueService.ticketByToken(token), {
    tables: ['queue_tickets'],
    enabled: Boolean(token),
  })

  if (ticket.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (ticket.error || !ticket.data) {
    return (
      <Card>
        <CardTitle>ไม่พบคิวนี้</CardTitle>
        <CardBody className="space-y-4">
          <p>ลิงก์อาจหมดอายุแล้ว หรือคิวถูกยกเลิกไป</p>
          <Link to="/">
            <Button variant="secondary">กลับไปรับคิวใหม่</Button>
          </Link>
        </CardBody>
      </Card>
    )
  }

  const data = ticket.data
  const isCalled = data.status === 'called'
  const estimate = data.ahead_count * MINUTES_PER_TICKET

  return (
    <div className="space-y-4">
      <Card className={isCalled ? 'border-brand-500 bg-brand-50' : undefined}>
        <div className="text-center">
          <p className="text-sm text-slate-600">หมายเลขคิวของคุณ</p>
          <p className="my-2 text-6xl font-bold tracking-tight text-brand-700">{data.ticket_no}</p>
          <p className="text-sm text-slate-600">
            {data.party_size} คน · รับคิวเมื่อ {formatClock(data.created_at)}
          </p>
        </div>
      </Card>

      {isCalled ? (
        <Card className="border-brand-500">
          <CardTitle>ถึงคิวคุณแล้ว</CardTitle>
          <CardBody>
            เรียกเมื่อ {formatClock(data.called_at)} — กรุณาไปที่เคาน์เตอร์เพื่อรับโต๊ะ
            <br />
            พนักงานจะให้ QR ประจำโต๊ะสำหรับสั่งอาหาร
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardTitle>{QUEUE_STATUS_LABELS[data.status]}</CardTitle>
          <CardBody className="space-y-1">
            <p>
              มีคิวก่อนหน้าคุณ{' '}
              <span className="font-semibold text-slate-900">{data.ahead_count}</span> คิว
            </p>
            <p>
              รออีกประมาณ{' '}
              <span className="font-semibold text-slate-900">{formatDuration(estimate)}</span>
            </p>
            <p className="pt-2 text-xs text-slate-500">
              หน้านี้อัปเดตอัตโนมัติ ไม่ต้องรีเฟรช · รอมาแล้ว{' '}
              {formatDuration(minutesSince(data.created_at))}
            </p>
          </CardBody>
        </Card>
      )}

      <p className="text-center text-xs text-slate-500">
        บันทึกลิงก์นี้ไว้เพื่อกลับมาดูสถานะคิวได้ตลอด
      </p>
    </div>
  )
}
