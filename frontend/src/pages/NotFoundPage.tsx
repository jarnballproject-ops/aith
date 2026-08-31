import { Link } from 'react-router'

import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-6xl font-bold text-slate-300">404</p>
      <h1 className="text-2xl font-semibold text-slate-900">ไม่พบหน้าที่คุณกำลังหา</h1>
      <Link to="/">
        <Button variant="secondary">กลับหน้าแรก</Button>
      </Link>
    </div>
  )
}
