export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'หมากระทุปุ๊ป๊ะ'
export const APP_TAGLINE = 'หิวปุ๊บ ป๊ะหมูกระทะปั๊บ'

export const STAFF_NAV = [
  { label: 'แดชบอร์ด', to: '/staff' },
  { label: 'คิว', to: '/staff/queue' },
  { label: 'ผังโต๊ะ', to: '/staff/tables' },
  { label: 'ครัว', to: '/staff/kitchen' },
] as const

export const ADMIN_NAV = [
  { label: 'ภาพรวม', to: '/admin' },
  { label: 'เมนู', to: '/admin/menu' },
] as const
