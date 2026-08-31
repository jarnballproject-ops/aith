import { Link, Outlet } from 'react-router'

import { APP_NAME, APP_TAGLINE } from '@/constants'

export function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-brand-700">{APP_NAME}</span>
            <span className="hidden text-xs text-slate-500 sm:inline">{APP_TAGLINE}</span>
          </Link>
          <Link to="/staff" className="text-xs text-slate-400 hover:text-slate-600">
            พนักงาน
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
