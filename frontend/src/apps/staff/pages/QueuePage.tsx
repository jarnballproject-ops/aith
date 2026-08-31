import { useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardTitle } from '@/components/ui/Card'
import { SelectField, TextField } from '@/components/ui/Field'
import { QrCode } from '@/components/ui/QrCode'
import { Spinner } from '@/components/ui/Spinner'
import { menuService } from '@/features/menu/menuService'
import { QUEUE_STATUS_LABELS, queueService, type QueueTicket } from '@/features/queue/queueService'
import { tableService } from '@/features/table/tableService'
import { visitService, type Visit } from '@/features/visit/visitService'
import { useLiveQuery } from '@/hooks/useLiveQuery'
import { formatDuration, minutesSince } from '@/lib/format'

export function QueuePage() {
  const tickets = useLiveQuery(() => queueService.listForStaff(), { tables: ['queue_tickets'] })
  const tables = useLiveQuery(() => tableService.list(), { tables: ['dining_tables'] })
  const packages = useLiveQuery(() => menuService.listPackages(), { tables: ['buffet_packages'] })

  const [seating, setSeating] = useState<QueueTicket | null>(null)
  const [openedVisit, setOpenedVisit] = useState<Visit | null>(null)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">จัดการคิว</h1>

      {openedVisit && (
        <QrHandoutCard visit={openedVisit} onClose={() => setOpenedVisit(null)} />
      )}

      {seating && (
        <SeatTicketCard
          ticket={seating}
          tables={tables.data ?? []}
          packages={packages.data ?? []}
          onCancel={() => setSeating(null)}
          onSeated={(visit) => {
            setSeating(null)
            setOpenedVisit(visit)
          }}
        />
      )}

      <Card>
        <CardTitle>คิววันนี้</CardTitle>
        {tickets.isLoading && <Spinner className="mt-4 size-5" />}

        <ul className="mt-3 divide-y divide-slate-100">
          {tickets.data?.map((ticket) => (
            <li key={ticket.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="w-16 text-lg font-bold text-brand-700">{ticket.ticket_no}</span>

              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-900">
                  {ticket.party_size} คน
                  {ticket.contact_name && ` · ${ticket.contact_name}`}
                  {ticket.contact_phone && ` · ${ticket.contact_phone}`}
                </p>
                <p className="text-xs text-slate-500">
                  รอมาแล้ว {formatDuration(minutesSince(ticket.created_at))}
                </p>
              </div>

              <Badge
                className={
                  ticket.status === 'called'
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-slate-100 text-slate-600'
                }
              >
                {QUEUE_STATUS_LABELS[ticket.status]}
              </Badge>

              <div className="flex gap-2">
                {ticket.status === 'waiting' && (
                  <Button size="sm" variant="secondary" onClick={() => void queueService.call(ticket.id)}>
                    เรียกคิว
                  </Button>
                )}
                <Button size="sm" onClick={() => setSeating(ticket)}>
                  จัดโต๊ะ
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void queueService.setStatus(ticket.id, 'no_show')}
                >
                  ไม่มา
                </Button>
              </div>
            </li>
          ))}
          {tickets.data?.length === 0 && (
            <li className="py-6 text-center text-sm text-slate-500">ยังไม่มีคิวรออยู่</li>
          )}
        </ul>
      </Card>
    </div>
  )
}

function SeatTicketCard({
  ticket,
  tables,
  packages,
  onCancel,
  onSeated,
}: {
  ticket: QueueTicket
  tables: Awaited<ReturnType<typeof tableService.list>>
  packages: Awaited<ReturnType<typeof menuService.listPackages>>
  onCancel: () => void
  onSeated: (visit: Visit) => void
}) {
  const suggested = tableService.suggestTable(tables, ticket.party_size)
  const [tableId, setTableId] = useState(suggested?.id ?? '')
  const [packageId, setPackageId] = useState(packages.at(0)?.id ?? '')
  const [adults, setAdults] = useState(String(ticket.party_size))
  const [children, setChildren] = useState('0')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const freeTables = tables.filter((table) => table.status === 'available')

  async function submit() {
    setError(null)
    setIsSubmitting(true)
    try {
      const visit = await visitService.open({
        tableId,
        packageId,
        adults: Number(adults),
        children: Number(children),
        ticketId: ticket.id,
      })
      onSeated(visit)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'เปิดโต๊ะไม่สำเร็จ')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-brand-300">
      <CardTitle>
        จัดโต๊ะให้คิว {ticket.ticket_no} ({ticket.party_size} คน)
      </CardTitle>

      {suggested && (
        <CardBody>
          แนะนำ: <span className="font-semibold text-brand-700">โต๊ะ {suggested.code}</span> (
          {suggested.seats} ที่นั่ง{suggested.zone && `, ${suggested.zone}`})
        </CardBody>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField label="โต๊ะ" value={tableId} onChange={(event) => setTableId(event.target.value)}>
          <option value="">เลือกโต๊ะ</option>
          {freeTables.map((table) => (
            <option key={table.id} value={table.id}>
              {table.code} · {table.seats} ที่นั่ง {table.zone ? `· ${table.zone}` : ''}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="แพ็กเกจ"
          value={packageId}
          onChange={(event) => setPackageId(event.target.value)}
        >
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name}
            </option>
          ))}
        </SelectField>

        <TextField
          label="ผู้ใหญ่"
          type="number"
          min={0}
          value={adults}
          onChange={(event) => setAdults(event.target.value)}
        />
        <TextField
          label="เด็ก"
          type="number"
          min={0}
          value={children}
          onChange={(event) => setChildren(event.target.value)}
        />
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <div className="mt-4 flex gap-2">
        <Button onClick={submit} disabled={!tableId || !packageId || isSubmitting}>
          เปิดโต๊ะและสร้าง QR
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          ยกเลิก
        </Button>
      </div>
    </Card>
  )
}

function QrHandoutCard({ visit, onClose }: { visit: Visit; onClose: () => void }) {
  const url = visitService.qrUrl(visit.access_token)

  return (
    <Card className="border-emerald-300 bg-emerald-50/40">
      <CardTitle>เปิดโต๊ะแล้ว — ให้ลูกค้าสแกน</CardTitle>
      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <QrCode value={url} />
        <div className="space-y-2 text-sm">
          <p className="font-medium text-slate-900">Visit {visit.code}</p>
          <p className="break-all text-xs text-slate-500">{url}</p>
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="secondary" onClick={() => window.print()}>
              พิมพ์
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              ปิด
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
