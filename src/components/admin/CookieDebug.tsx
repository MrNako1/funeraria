'use client'

import { useEffect, useState, useCallback } from 'react'
import { checkPersistentSession, clearAuthCookies } from '@/lib/auth-config'

interface CookieInfo {
  name: string
  value: string
  domain: string
  path: string
  expires: string
  secure: boolean
  httpOnly: boolean
  sameSite: string
}

interface SessionInfo {
  hasLocalStorage: boolean
  hasSessionStorage: boolean
  hasCookies: boolean
  hasAnySession: boolean
}

export default function CookieDebug() {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [cookies, setCookies] = useState<CookieInfo[]>([])
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const checkCookies = useCallback(() => {
    try {
      // Verificar sesión persistente
      const sessionData = checkPersistentSession()
      setSessionInfo(sessionData)

      // Obtener información de cookies
      const cookieString = document.cookie
      const cookieList: CookieInfo[] = []

      if (cookieString) {
        cookieString.split(';').forEach(cookie => {
          const [name, value] = cookie.trim().split('=')
          if (name && value) {
            cookieList.push({
              name: name.trim(),
              value: value.trim(),
              domain: 'N/A',
              path: 'N/A',
              expires: 'N/A',
              secure: false,
              httpOnly: false,
              sameSite: 'N/A'
            })
          }
        })
      }

      setCookies(cookieList)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error checking cookies:', error)
    }
  }, [])

  // Auto-refresh cada 5 segundos
  useEffect(() => {
    checkCookies()

    const interval = setInterval(() => {
      checkCookies()
    }, 5000) // 5 segundos

    return () => clearInterval(interval)
  }, [checkCookies])

  // Toggle visibility con Ctrl+Shift+C
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        setIsVisible(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleClearCookies = () => {
    try {
      clearAuthCookies()
      checkCookies()
      console.log('✅ Cookies limpiadas')
    } catch (error) {
      console.error('❌ Error limpiando cookies:', error)
    }
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
    <div className={`fixed bottom-4 right-4 bg-black text-white rounded-lg text-xs z-50 transition-all duration-300 ${
      isExpanded ? 'max-w-2xl' : 'max-w-xs'
    }`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-400">🍪</span>
            <h3 className="font-bold">Debug de Cookies</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={checkCookies}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="Actualizar"
            >
              🔄
            </button>
            <button
              onClick={handleClearCookies}
              className="text-red-400 hover:text-red-300 transition-colors"
              title="Limpiar Cookies"
            >
              🧹
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
        {/* Estado de sesión */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between">
            <span>localStorage:</span>
            <span className={sessionInfo?.hasLocalStorage ? 'text-green-400' : 'text-red-400'}>
              {sessionInfo?.hasLocalStorage ? '✅ Sí' : '❌ No'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>sessionStorage:</span>
            <span className={sessionInfo?.hasSessionStorage ? 'text-green-400' : 'text-red-400'}>
              {sessionInfo?.hasSessionStorage ? '✅ Sí' : '❌ No'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Cookies:</span>
            <span className={sessionInfo?.hasCookies ? 'text-green-400' : 'text-red-400'}>
              {sessionInfo?.hasCookies ? '✅ Sí' : '❌ No'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Sesión Activa:</span>
            <span className={sessionInfo?.hasAnySession ? 'text-green-400' : 'text-red-400'}>
              {sessionInfo?.hasAnySession ? '✅ Sí' : '❌ No'}
            </span>
          </div>
        </div>

        {/* Información expandida */}
        {isExpanded && (
          <div className="space-y-2 pt-2 border-t border-gray-700">
            <div>
              <span className="text-gray-400">Total de cookies:</span>
              <span className="text-blue-400 ml-1">{cookies.length}</span>
            </div>
            
            {cookies.length > 0 && (
              <div>
                <span className="text-gray-400">Cookies encontradas:</span>
                <div className="mt-1 space-y-1">
                  {cookies.map((cookie, index) => (
                    <div key={index} className="bg-gray-800 p-2 rounded text-xs">
                      <div className="flex justify-between">
                        <span className="text-yellow-400">{cookie.name}</span>
                        <span className="text-gray-500 text-xs">
                          {cookie.value.length > 20 ? `${cookie.value.substring(0, 20)}...` : cookie.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <span className="text-gray-400">localStorage keys:</span>
              <div className="mt-1 text-xs text-gray-300">
                {Object.keys(localStorage).filter(key => key.includes('supabase') || key.includes('auth')).map(key => (
                  <div key={key} className="bg-gray-800 p-1 rounded mb-1">
                    {key}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
          Presiona Ctrl+Shift+C para mostrar/ocultar
        </div>
      </div>
    </div>
  )
} 