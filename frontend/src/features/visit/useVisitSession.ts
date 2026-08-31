import { useEffect, useState } from 'react'

import { authService } from '@/features/auth/authService'
import { visitService } from '@/features/visit/visitService'

interface VisitSession {
  visitId: string | null
  error: Error | null
  isLoading: boolean
}

/**
 * ขั้นตอนหลังลูกค้าสแกน QR: สร้าง session แบบไม่ต้องสมัครสมาชิก แล้วผูกเข้ากับ visit
 * ต้องทำสองอย่างนี้ให้เสร็จก่อน ไม่งั้น RLS จะกันข้อมูลของโต๊ะไว้ทั้งหมด
 */
export function useVisitSession(token: string): VisitSession {
  const [state, setState] = useState<VisitSession>({
    visitId: null,
    error: null,
    isLoading: true,
  })

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        await authService.ensureGuestSession()
        const visit = await visitService.join(token)
        if (!cancelled) setState({ visitId: visit.id, error: null, isLoading: false })
      } catch (caught) {
        if (!cancelled) {
          setState({
            visitId: null,
            error: caught instanceof Error ? caught : new Error(String(caught)),
            isLoading: false,
          })
        }
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [token])

  return state
}
