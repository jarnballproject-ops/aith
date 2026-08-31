import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

import type { Tables } from '@/types/database.types'

export type Profile = Tables<'profiles'>
export type AppRole = Profile['role']

export interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  role: AppRole
  isStaff: boolean
  isManager: boolean
  /** true จนกว่าจะรู้ผลว่ามี session เดิมค้างอยู่หรือไม่ */
  isLoading: boolean
  refreshProfile: () => Promise<void>
}

// แยกไว้คนละไฟล์กับ provider เพื่อให้ fast refresh ทำงานได้
export const AuthContext = createContext<AuthContextValue | null>(null)

export const STAFF_ROLES: AppRole[] = ['kitchen', 'staff', 'cashier', 'manager', 'owner']
export const MANAGER_ROLES: AppRole[] = ['manager', 'owner']

export const ROLE_LABELS: Record<AppRole, string> = {
  customer: 'ลูกค้า',
  kitchen: 'ครัว',
  staff: 'พนักงาน',
  cashier: 'แคชเชียร์',
  manager: 'ผู้จัดการ',
  owner: 'เจ้าของร้าน',
}
