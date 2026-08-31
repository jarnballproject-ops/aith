import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardTitle } from '@/components/ui/Card'
import { TextField } from '@/components/ui/Field'
import { APP_NAME } from '@/constants'
import { authService } from '@/features/auth/authService'
import { useAuth } from '@/hooks/useAuth'

export function StaffLoginPage() {
  const { user, role } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const { error: signInError } = await authService.signIn(email, password)
    if (signInError) setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    setIsSubmitting(false)
  }

  // login สำเร็จแต่ role ยังเป็นลูกค้า แปลว่ายังไม่ได้ตั้งสิทธิ์ให้บัญชีนี้
  const needsRole = user !== null && role === 'customer'

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm">
        <CardTitle>เข้าสู่ระบบพนักงาน</CardTitle>
        <CardBody className="mb-2">{APP_NAME}</CardBody>

        {needsRole ? (
          <div className="space-y-3 text-sm">
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
              บัญชีนี้ยังไม่มีสิทธิ์พนักงาน ให้ผู้ดูแลรันคำสั่งนี้ใน Supabase SQL Editor:
            </p>
            <code className="block overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
              update profiles set role = &apos;manager&apos; where id = &apos;{user.id}&apos;;
            </code>
            <Button variant="secondary" className="w-full" onClick={() => void authService.signOut()}>
              ออกจากระบบ
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="อีเมล"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              label="รหัสผ่าน"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              เข้าสู่ระบบ
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
