import { supabase } from '@/lib/supabase'

export const ANON_DISABLED_MESSAGE =
  'ยังไม่ได้เปิด Anonymous sign-ins ใน Supabase — ไปที่ Dashboard > Authentication > Sign In / Providers ' +
  'แล้วเปิด "Allow anonymous sign-ins" ลูกค้าถึงจะสแกน QR เข้าใช้งานได้โดยไม่ต้องสมัครสมาชิก'

export const authService = {
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signUp: (email: string, password: string, displayName?: string) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    }),

  signOut: () => supabase.auth.signOut(),

  /**
   * ลูกค้าไม่ต้องสมัครสมาชิก แต่ระบบยังต้องมี auth.uid() เพื่อผูกเข้ากับ visit
   * และเพื่อให้ RLS ยอมให้ subscribe realtime ได้ จึงใช้ anonymous session แทน
   */
  async ensureGuestSession() {
    const { data } = await supabase.auth.getSession()
    if (data.session) return data.session

    const { data: created, error } = await supabase.auth.signInAnonymously()
    if (error) {
      if (error.message.toLowerCase().includes('anonymous')) {
        throw new Error(ANON_DISABLED_MESSAGE)
      }
      throw error
    }
    return created.session
  },
}
