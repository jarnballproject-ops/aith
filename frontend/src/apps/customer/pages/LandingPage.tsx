import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'

import { Card, CardBody, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { APP_TAGLINE } from '@/constants'
import { menuService } from '@/features/menu/menuService'
import { QUEUE_STATUS_LABELS, queueService } from '@/features/queue/queueService'
import { useLiveQuery } from '@/hooks/useLiveQuery'
import { formatBaht } from '@/lib/format'

export function LandingPage() {
  const navigate = useNavigate()
  const [partySize, setPartySize] = useState('2')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const board = useLiveQuery(() => queueService.board(), { tables: ['queue_tickets'] })
  const packages = useLiveQuery(() => menuService.listPackages(), { tables: ['buffet_packages'] })

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const ticket = await queueService.takeTicket(Number(partySize), name, phone)
      // claim_token คือกุญแจเปิดดูคิวตัวเอง เก็บไว้ใน URL ให้ลูกค้า bookmark ได้
      navigate(`/q/${ticket.claim_token}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'รับคิวไม่สำเร็จ ลองใหม่อีกครั้ง')
    } finally {
      setIsSubmitting(false)
    }
  }

  const waiting = board.data?.filter((ticket) => ticket.status === 'waiting') ?? []

  return (
    <div className="space-y-6">
      <section className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-slate-900">ยินดีต้อนรับ</h1>
        <p className="text-slate-600">{APP_TAGLINE}</p>
      </section>

      <Card>
        <CardTitle>รับคิว</CardTitle>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <TextField
            label="จำนวนคน"
            type="number"
            min={1}
            max={30}
            required
            value={partySize}
            onChange={(event) => setPartySize(event.target.value)}
          />
          <TextField
            label="ชื่อ (ไม่บังคับ)"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="ชื่อสำหรับเรียกคิว"
          />
          <TextField
            label="เบอร์โทร (ไม่บังคับ)"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            hint="ใส่ไว้เผื่อร้านโทรตามตอนถึงคิว"
          />

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="size-4 border-white/40 border-t-white" /> : null}
            รับคิว
          </Button>
        </form>
      </Card>

      <Card>
        <CardTitle>คิวตอนนี้</CardTitle>
        <CardBody>
          {board.isLoading && <Spinner className="size-4" />}
          {board.error && <p className="text-rose-600">โหลดคิวไม่สำเร็จ</p>}
          {board.data && (
            <>
              <p className="mb-3">
                รออยู่ <span className="font-semibold text-slate-900">{waiting.length}</span> คิว
              </p>
              <div className="flex flex-wrap gap-2">
                {board.data.map((ticket) => (
                  <span
                    key={ticket.id}
                    className={
                      ticket.status === 'called'
                        ? 'rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white'
                        : 'rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600'
                    }
                    title={QUEUE_STATUS_LABELS[ticket.status]}
                  >
                    {ticket.ticket_no} · {ticket.party_size} คน
                  </span>
                ))}
                {board.data.length === 0 && <span className="text-slate-500">ยังไม่มีคิว เข้ามาได้เลย</span>}
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardTitle>แพ็กเกจ</CardTitle>
        <CardBody className="space-y-3">
          {packages.data?.map((pkg) => (
            <div key={pkg.id} className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900">{pkg.name}</p>
                <p className="text-xs text-slate-500">{pkg.description}</p>
              </div>
              <div className="text-right whitespace-nowrap">
                <p className="font-semibold text-brand-700">{formatBaht(pkg.price_adult)}</p>
                <p className="text-xs text-slate-500">เด็ก {formatBaht(pkg.price_child)}</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  )
}
