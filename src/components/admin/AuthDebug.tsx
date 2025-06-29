'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Session } from '@supabase/supabase-js'

interface SessionInfo {
  session: Session | null
  error: Error | null
}

export default function AuthDebug() {
  const { user, userRole, loading } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      setSessionInfo({ session, error })
    }
    
    checkSession()
  }, [supabase])

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🔍 Debug de Autenticación</h3>
      <div className="space-y-1">
        <div>Loading: <span className={loading ? 'text-yellow-400' : 'text-green-400'}>{loading ? 'Sí' : 'No'}</span></div>
        <div>Usuario: <span className={user ? 'text-green-400' : 'text-red-400'}>{user ? 'Sí' : 'No'}</span></div>
        <div>Email: <span className="text-blue-400">{user?.email || 'N/A'}</span></div>
        <div>Rol: <span className="text-purple-400">{userRole || 'N/A'}</span></div>
        <div>Es Admin: <span className={userRole === 'admin' ? 'text-green-400' : 'text-red-400'}>{userRole === 'admin' ? 'Sí' : 'No'}</span></div>
        <div>Session: <span className={sessionInfo?.session ? 'text-green-400' : 'text-red-400'}>{sessionInfo?.session ? 'Activa' : 'Inactiva'}</span></div>
        {sessionInfo?.error && (
          <div>Error: <span className="text-red-400">{sessionInfo.error.message}</span></div>
        )}
      </div>
    </div>
  )
} 