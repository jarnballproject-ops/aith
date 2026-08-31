import { NavLink, Outlet } from 'react-router'

import { StaffLoginPage } from '@/apps/staff/StaffLoginPage'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { APP_NAME, STAFF_NAV } from '@/constants'
import { ROLE_LABELS } from '@/context/auth-context'
import { authService } from '@/features/auth/authService'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'

export function StaffLayout() {
  const { isStaff, isLoading, profile, role } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!isStaff) return <StaffLoginPage />

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <span className="font-bold text-brand-700">{APP_NAME}</span>
            <nav className="flex gap-1">
              {STAFF_NAV.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/staff'}
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
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 sm:inline">
              {profile?.display_name ?? 'พนักงาน'} · {ROLE_LABELS[role]}
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
