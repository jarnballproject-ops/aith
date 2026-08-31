import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'

import { AuthContext, MANAGER_ROLES, STAFF_ROLES, type Profile } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    setProfile(data ?? null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      await loadProfile(data.session?.user.id)
      setIsLoading(false)
    })

    // ครอบคลุมทั้ง login, logout, token refresh และการเปลี่ยนแปลงจากแท็บอื่น
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
      // อย่า await ใน callback นี้ — supabase-js ถือ lock ของ auth อยู่ระหว่างที่มันทำงาน
      void loadProfile(nextSession?.user.id)
    })

    return () => listener.subscription.unsubscribe()
  }, [loadProfile])

  const role = profile?.role ?? 'customer'

  return (
    <AuthContext
      value={{
        session,
        user: session?.user ?? null,
        profile,
        role,
        isStaff: STAFF_ROLES.includes(role),
        isManager: MANAGER_ROLES.includes(role),
        isLoading,
        refreshProfile: () => loadProfile(session?.user.id),
      }}
    >
      {children}
    </AuthContext>
  )
}
