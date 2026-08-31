import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/** เรนเดอร์ QR เป็น data URL — ใช้กับ QR ประจำโต๊ะที่พนักงานให้ลูกค้าสแกน */
export function QrCode({ value, size = 220 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(value, { width: size, margin: 1 })
      .then((url) => {
        if (!cancelled) setSrc(url)
      })
      .catch(() => {
        if (!cancelled) setSrc(null)
      })
    return () => {
      cancelled = true
    }
  }, [value, size])

  if (!src) {
    return (
      <div
        className="animate-pulse rounded-lg bg-slate-100"
        style={{ width: size, height: size }}
        aria-label="กำลังสร้าง QR"
      />
    )
  }

  return <img src={src} width={size} height={size} alt={`QR สำหรับ ${value}`} />
}
