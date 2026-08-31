import { useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardTitle } from '@/components/ui/Card'
import { SelectField } from '@/components/ui/Field'
import { QrCode } from '@/components/ui/QrCode'
import { Spinner } from '@/components/ui/Spinner'
import {
  PAYMENT_METHOD_LABELS,
  billingService,
  type PaymentMethod,
} from '@/features/billing/billingService'
import {
  TABLE_STATUS_LABELS,
  TABLE_STATUS_STYLES,
  tableService,
  type DiningTable,
} from '@/features/table/tableService'
import { VISIT_STATUS_LABELS, visitService, type VisitDetail } from '@/features/visit/visitService'
import { useLiveQuery } from '@/hooks/useLiveQuery'
import { cn } from '@/lib/cn'
import { formatBaht, formatDuration, minutesLeft, minutesSince } from '@/lib/format'

export function TablesPage() {
  const tables = useLiveQuery(() => tableService.list(), { tables: ['dining_tables'] })
  const visits = useLiveQuery(() => visitService.listActive(), { tables: ['visits'] })
  const [selected, setSelected] = useState<string | null>(null)

  const visitByTable = new Map((visits.data ?? []).map((visit) => [visit.table_id, visit]))
  const selectedTable = tables.data?.find((table) => table.id === selected) ?? null
  const selectedVisit = selected ? (visitByTable.get(selected) ?? null) : null

  if (tables.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">ผังโต๊ะ</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {tables.data?.map((table) => (
          <TableTile
            key={table.id}
            table={table}
            visit={visitByTable.get(table.id) ?? null}
            isSelected={selected === table.id}
            onSelect={() => setSelected(selected === table.id ? null : table.id)}
          />
        ))}
      </div>

      {selectedTable && (
        <TableDetail
          table={selectedTable}
          visit={selectedVisit}
          onDone={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function TableTile({
  table,
  visit,
  isSelected,
  onSelect,
}: {
  table: DiningTable
  visit: VisitDetail | null
  isSelected: boolean
  onSelect: () => void
}) {
  const remaining = minutesLeft(visit?.expires_at ?? null)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'rounded-xl border p-3 text-left transition-shadow hover:shadow-md',
        TABLE_STATUS_STYLES[table.status],
        isSelected && 'ring-2 ring-brand-500 ring-offset-2',
      )}
    >
      <p className="text-lg font-bold">{table.code}</p>
      <p className="text-xs opacity-80">{TABLE_STATUS_LABELS[table.status]}</p>
      <p className="mt-1 text-xs opacity-70">
        {visit && remaining !== null
          ? remaining > 0
            ? `เหลือ ${formatDuration(remaining)}`
            : 'หมดเวลา'
          : `${table.seats} ที่นั่ง`}
      </p>
    </button>
  )
}

function TableDetail({
  table,
  visit,
  onDone,
}: {
  table: DiningTable
  visit: VisitDetail | null
  onDone: () => void
}) {
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bill = useLiveQuery(
    () => (visit ? billingService.getByVisit(visit.id) : Promise.resolve(null)),
    { tables: ['bills'], enabled: Boolean(visit) },
    [visit?.id],
  )

  async function run(action: () => Promise<unknown>) {
    setError(null)
    setBusy(true)
    try {
      await action()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ทำรายการไม่สำเร็จ')
    } finally {
      setBusy(false)
    }
  }

  if (!visit) {
    return (
      <Card>
        <CardTitle>โต๊ะ {table.code}</CardTitle>
        <CardBody>
          {TABLE_STATUS_LABELS[table.status]} · {table.seats} ที่นั่ง
          {table.zone && ` · ${table.zone}`}
        </CardBody>
        <div className="mt-4 flex flex-wrap gap-2">
          {table.status === 'cleaning' && (
            <Button onClick={() => void run(() => tableService.setStatus(table.id, 'available'))}>
              เคลียร์เสร็จ ตั้งเป็นว่าง
            </Button>
          )}
          {table.status === 'available' && (
            <Button
              variant="secondary"
              onClick={() => void run(() => tableService.setStatus(table.id, 'reserved'))}
            >
              จองโต๊ะ
            </Button>
          )}
          {table.status === 'reserved' && (
            <Button
              variant="secondary"
              onClick={() => void run(() => tableService.setStatus(table.id, 'available'))}
            >
              ยกเลิกการจอง
            </Button>
          )}
          <Button variant="ghost" onClick={onDone}>
            ปิด
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </Card>
    )
  }

  return (
    <Card className="border-brand-300">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <CardTitle>
            โต๊ะ {table.code} · {visit.code}
          </CardTitle>
          <CardBody className="space-y-0.5">
            <p>
              {visit.buffet_packages?.name} · ผู้ใหญ่ {visit.adults} คน
              {visit.children > 0 && `, เด็ก ${visit.children} คน`}
            </p>
            <p>เปิดโต๊ะมาแล้ว {formatDuration(minutesSince(visit.opened_at))}</p>
          </CardBody>
        </div>
        <Badge className="bg-brand-50 text-brand-700">{VISIT_STATUS_LABELS[visit.status]}</Badge>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
        <div>
          <QrCode value={visitService.qrUrl(visit.access_token)} size={180} />
          <p className="mt-1 text-xs text-slate-500">QR ประจำโต๊ะ</p>
        </div>

        <div className="space-y-3">
          {bill.data ? (
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">ยอดรวม</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatBaht(bill.data.total)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                สถานะบิล: {bill.data.status === 'paid' ? 'ชำระแล้ว' : 'รอชำระ'}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">ยังไม่ได้เปิดบิล</p>
          )}

          <div className="flex flex-wrap items-end gap-2">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => void run(() => billingService.issue(visit.id))}
            >
              {bill.data ? 'คิดยอดใหม่' : 'เปิดบิล'}
            </Button>

            {bill.data && bill.data.status !== 'paid' && (
              <>
                <div className="w-40">
                  <SelectField
                    label="ช่องทาง"
                    value={method}
                    onChange={(event) => setMethod(event.target.value as PaymentMethod)}
                  >
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </SelectField>
                </div>
                <Button
                  disabled={busy}
                  onClick={() =>
                    void run(() =>
                      billingService.pay(bill.data!.id, method, bill.data!.total),
                    )
                  }
                >
                  รับชำระ {formatBaht(bill.data.total)}
                </Button>
              </>
            )}

            {(visit.status === 'paid' || bill.data?.status === 'paid') && (
              <Button
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await visitService.close(visit.id)
                    onDone()
                  })
                }
              >
                ปิดโต๊ะ
              </Button>
            )}

            <Button variant="ghost" onClick={onDone}>
              ปิดหน้าต่าง
            </Button>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
      </div>
    </Card>
  )
}
