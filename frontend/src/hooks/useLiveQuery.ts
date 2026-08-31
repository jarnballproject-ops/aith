import { useCallback, useEffect, useRef, useState } from 'react'

import { supabase } from '@/lib/supabase'

interface State<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
}

interface Options {
  /** ตารางที่ต้องเฝ้า — มีอะไรเปลี่ยนในตารางเหล่านี้แล้วจะดึงข้อมูลใหม่ */
  tables: string[]
  /** ปิดการดึงข้อมูลไว้ก่อน เช่นตอนที่ยังไม่รู้ visit id */
  enabled?: boolean
}

/**
 * ดึงข้อมูลหนึ่งก้อนแล้วดึงซ้ำทุกครั้งที่ตารางที่เฝ้าอยู่มีการเปลี่ยนแปลง
 *
 * เลือกวิธี refetch ทั้งก้อนแทนการ patch state จาก payload ของ realtime เพราะ
 * query ส่วนใหญ่ในระบบนี้เป็น join หลายตาราง การ patch ทีละแถวจะพลาดง่ายกว่ามาก
 * และ payload ที่ RLS กรองออกจะทำให้ state ไม่ตรงกับฐานข้อมูลโดยไม่รู้ตัว
 */
export function useLiveQuery<T>(fetcher: () => Promise<T>, options: Options, deps: unknown[] = []) {
  const { tables, enabled = true } = options
  const [state, setState] = useState<State<T>>({ data: null, error: null, isLoading: enabled })

  // fetcher ถูกสร้างใหม่ทุก render — ผูก identity ไว้กับ deps ที่ผู้เรียกกำหนดแทน
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableFetcher = useCallback(fetcher, deps)
  const tableKey = tables.join(',')

  const requestId = useRef(0)

  const refetch = useCallback(async () => {
    if (!enabled) return
    const id = ++requestId.current
    try {
      const data = await stableFetcher()
      // ผลลัพธ์ที่มาช้ากว่า request ล่าสุดต้องถูกทิ้ง ไม่งั้นข้อมูลเก่าจะทับข้อมูลใหม่
      if (id === requestId.current) setState({ data, error: null, isLoading: false })
    } catch (error) {
      if (id === requestId.current) {
        setState({
          data: null,
          error: error instanceof Error ? error : new Error(String(error)),
          isLoading: false,
        })
      }
    }
  }, [stableFetcher, enabled])

  useEffect(() => {
    void refetch()
  }, [refetch])

  useEffect(() => {
    if (!enabled || tableKey === '') return

    const channel = supabase.channel(`live:${tableKey}:${Math.random().toString(36).slice(2)}`)
    for (const table of tableKey.split(',')) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        void refetch()
      })
    }
    channel.subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [tableKey, enabled, refetch])

  return { ...state, refetch }
}
