'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Session } from '@supabase/supabase-js'

interface SessionInfo {
  session: Session | null
  error: Error | null
  lastChecked: Date
}

export default function AuthDebug() {
  const { user, userRole, loading } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const supabase = createClientComponentClient()

  const checkSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      setSessionInfo({ 
        session, 
        error, 
        lastChecked: new Date() 
      })
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error checking session:', error)
      setSessionInfo({ 
        session: null, 
        error: error as Error, 
        lastChecked: new Date() 
      })
    }
  }, [supabase])

  // Auto-refresh cada 10 segundos
  useEffect(() => {
    checkSession()

    const interval = setInterval(() => {
      checkSession()
    }, 10000) // 10 segundos

    return () => clearInterval(interval)
  }, [checkSession])

  // Toggle visibility con Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const getStatusColor = (condition: boolean) => {
    return condition ? 'text-green-400' : 'text-red-400'
  }

  const getStatusText = (condition: boolean) => {
    return condition ? '✅ Sí' : '❌ No'
  }

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className={`fixed bottom-4 left-4 bg-black text-white rounded-lg text-xs z-50 transition-all duration-300 ${
      isExpanded ? 'max-w-md' : 'max-w-xs'
    }`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-400">🔍</span>
            <h3 className="font-bold">Debug de Autenticación</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => checkSession()}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="Actualizar"
            >
              🔄
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
              title={isExpanded ? "Contraer" : "Expandir"}
            >
              {isExpanded ? '📉' : '📈'}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-red-400 hover:text-red-300 transition-colors"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Última actualización: {formatDate(lastRefresh)}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Estado básico */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between">
            <span>Loading:</span>
            <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
              {loading ? '⏳ Sí' : '✅ No'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Usuario:</span>
            <span className={getStatusColor(!!user)}>
              {getStatusText(!!user)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Es Admin:</span>
            <span className={getStatusColor(userRole === 'admin')}>
              {getStatusText(userRole === 'admin')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Session:</span>
            <span className={getStatusColor(!!sessionInfo?.session)}>
              {getStatusText(!!sessionInfo?.session)}
            </span>
          </div>
        </div>

        {/* Información expandida */}
        {isExpanded && (
          <div className="space-y-2 pt-2 border-t border-gray-700">
            <div>
              <span className="text-gray-400">Email:</span>
              <span className="text-blue-400 ml-1">{user?.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400">Rol:</span>
              <span className="text-purple-400 ml-1">{userRole || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400">ID:</span>
              <span className="text-gray-300 ml-1 text-xs">
                {user?.id ? `${user.id.slice(0, 8)}...` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Creado:</span>
              <span className="text-gray-300 ml-1 text-xs">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
              </span>
            </div>
            {sessionInfo?.session && (
              <div>
                <span className="text-gray-400">Expira:</span>
                <span className="text-gray-300 ml-1 text-xs">
                  {new Date(sessionInfo.session.expires_at! * 1000).toLocaleString('es-ES')}
                </span>
              </div>
            )}
            {sessionInfo?.error && (
              <div className="text-red-400 text-xs">
                Error: {sessionInfo.error.message}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
          Presiona Ctrl+Shift+D para mostrar/ocultar
        </div>
      </div>
    </div>
  )
} 