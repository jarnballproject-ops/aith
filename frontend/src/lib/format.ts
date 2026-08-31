const baht = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  maximumFractionDigits: 0,
})

const clock = new Intl.DateTimeFormat('th-TH', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Bangkok',
})

export const formatBaht = (amount: number) => baht.format(amount)

export const formatClock = (iso: string | null | undefined) =>
  iso ? clock.format(new Date(iso)) : '—'

/** นาทีที่ผ่านไปนับจากเวลาที่ให้มา ใช้บอกว่าออเดอร์ค้างมานานแค่ไหน */
export function minutesSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000))
}

/** เวลาที่เหลือของโต๊ะ — คืนค่าติดลบไม่ได้ เพราะ UI แสดง "หมดเวลา" แทน */
export function minutesLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  return Math.floor((new Date(expiresAt).getTime() - Date.now()) / 60_000)
}

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(Math.abs(totalMinutes) / 60)
  const minutes = Math.abs(totalMinutes) % 60
  if (hours === 0) return `${minutes} นาที`
  return minutes === 0 ? `${hours} ชม.` : `${hours} ชม. ${minutes} นาที`
}
