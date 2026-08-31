import { useState } from 'react'

import { SERVICE_CALL_LABELS, orderService, type ServiceCallType } from '@/features/order/orderService'

const QUICK_CALLS: ServiceCallType[] = ['staff', 'water', 'utensils', 'charcoal']

export function ServiceCallBar({ visitId }: { visitId: string }) {
  const [pending, setPending] = useState<ServiceCallType | null>(null)
  const [sent, setSent] = useState<ServiceCallType | null>(null)

  async function call(type: ServiceCallType) {
    setPending(type)
    try {
      await orderService.callStaff(visitId, type)
      setSent(type)
      window.setTimeout(() => setSent(null), 4000)
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl gap-2 overflow-x-auto px-4 py-2">
        {QUICK_CALLS.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => call(type)}
            disabled={pending !== null}
            className="shrink-0 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            {sent === type ? '✓ แจ้งแล้ว' : SERVICE_CALL_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  )
}
