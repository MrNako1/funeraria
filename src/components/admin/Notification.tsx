'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
  duration?: number
  showProgress?: boolean
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export default function Notification({ 
  message, 
  type, 
  onClose, 
  duration = 5000,
  showProgress = true,
  persistent = false,
  action
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const startTimer = useCallback(() => {
    if (persistent || !showProgress) return

    const startTime = Date.now()
    const endTime = startTime + duration

    const updateProgress = () => {
      if (isPaused) return

      const now = Date.now()
      const remaining = Math.max(0, endTime - now)
      const newProgress = (remaining / duration) * 100

      setProgress(newProgress)

      if (remaining > 0) {
        timeoutRef.current = setTimeout(updateProgress, 10)
      } else {
        handleClose()
      }
    }

    updateProgress()
  }, [duration, isPaused, persistent, showProgress])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Esperar a que termine la animación
  }, [onClose])

  const handlePause = useCallback(() => {
    if (persistent) return
    setIsPaused(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [persistent])

  const handleResume = useCallback(() => {
    if (persistent) return
    setIsPaused(false)
    startTimer()
  }, [persistent, startTimer])

  useEffect(() => {
    startTimer()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [startTimer])

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: 'text-green-400',
          progress: 'bg-green-500',
          action: 'bg-green-600 hover:bg-green-700'
        }
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-400',
          progress: 'bg-red-500',
          action: 'bg-red-600 hover:bg-red-700'
        }
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: 'text-yellow-400',
          progress: 'bg-yellow-500',
          action: 'bg-yellow-600 hover:bg-yellow-700'
        }
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'text-blue-400',
          progress: 'bg-blue-500',
          action: 'bg-blue-600 hover:bg-blue-700'
        }
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: 'text-gray-400',
          progress: 'bg-gray-500',
          action: 'bg-gray-600 hover:bg-gray-700'
        }
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  const styles = getTypeStyles()

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
    >
      <div className={`rounded-lg border p-4 shadow-lg ${styles.container}`}>
        {/* Barra de progreso */}
        {showProgress && !persistent && (
          <div className="w-full bg-gray-200 rounded-full h-1 mb-3 overflow-hidden">
            <div
              ref={progressRef}
              className={`h-full transition-all duration-100 ease-linear ${styles.progress}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className={`text-lg ${styles.icon}`}>{getIcon()}</span>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium leading-5">{message}</p>
            {action && (
              <button
                onClick={action.onClick}
                className={`mt-2 text-xs font-medium text-white px-3 py-1 rounded-md transition-colors ${styles.action}`}
              >
                {action.label}
              </button>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors hover:bg-opacity-80 ${
                type === 'success' ? 'focus:ring-green-500 hover:bg-green-100' :
                type === 'error' ? 'focus:ring-red-500 hover:bg-red-100' :
                type === 'warning' ? 'focus:ring-yellow-500 hover:bg-yellow-100' :
                'focus:ring-blue-500 hover:bg-blue-100'
              }`}
              onClick={handleClose}
            >
              <span className="sr-only">Cerrar</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Indicador de pausa */}
        {isPaused && !persistent && (
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <span className="mr-1">⏸️</span>
            Pausado
          </div>
        )}
      </div>
    </div>
  )
} 