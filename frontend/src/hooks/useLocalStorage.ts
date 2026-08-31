import { useCallback, useEffect, useState } from 'react'

/** เก็บ state ไว้ใน localStorage และซิงก์ข้ามแท็บให้อัตโนมัติ */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // โหมดส่วนตัวหรือ storage เต็ม — ข้ามไปโดยไม่ทำให้ UI พัง
    }
  }, [key, value])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key || event.newValue === null) return
      try {
        setValue(JSON.parse(event.newValue) as T)
      } catch {
        // ค่าที่แท็บอื่นเขียนไว้ไม่ใช่ JSON ที่อ่านได้ — คงค่าเดิมไว้
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  const remove = useCallback(() => {
    window.localStorage.removeItem(key)
    setValue(initialValue)
  }, [key, initialValue])

  return { value, setValue, remove }
}
