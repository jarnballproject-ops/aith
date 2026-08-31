import { NavLink, Outlet } from 'react-router'

import { StaffLoginPage } from '@/apps/staff/StaffLoginPage'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ADMIN_NAV, APP_NAME } from '@/constants'
import { ROLE_LABELS } from '@/context/auth-context'
import { authService } from '@/features/auth/authService'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'

export function AdminLayout() {
  const { isStaff, isManager, isLoading, role, profile } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!isStaff) return <StaffLoginPage />

  if (!isManager) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-sm">
          <CardTitle>เข้าถึงไม่ได้</CardTitle>
          <CardBody>
            หลังบ้านเปิดให้เฉพาะผู้จัดการและเจ้าของร้าน — สิทธิ์ปัจจุบันของคุณคือ{' '}
            {ROLE_LABELS[role]}
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <span className="font-bold text-brand-700">{APP_NAME} · หลังบ้าน</span>
            <nav className="flex gap-1">
              {ADMIN_NAV.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/admin'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to="/staff"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                หน้าร้าน
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 sm:inline">
              {profile?.display_name ?? ROLE_LABELS[role]}
            </span>
            <Button variant="ghost" size="sm" onClick={() => void authService.signOut()}>
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
