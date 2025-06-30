'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  type?: 'danger' | 'warning' | 'info' | 'success'
  isLoading?: boolean
  loadingText?: string
  showCancelButton?: boolean
  autoFocus?: boolean
  closeOnOverlayClick?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'danger',
  isLoading = false,
  loadingText = 'Procesando...',
  showCancelButton = true,
  autoFocus = true,
  closeOnOverlayClick = true,
  size = 'md'
}: ConfirmModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [internalLoading, setInternalLoading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // Manejar animaciones de entrada/salida
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsAnimating(true)
      // Pequeño delay para asegurar que la animación se ejecute
      const timer = setTimeout(() => setIsAnimating(false), 50)
      return () => clearTimeout(timer)
    } else {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Auto-focus en el botón de confirmar
  useEffect(() => {
    if (isOpen && autoFocus && confirmButtonRef.current && !isLoading) {
      const timer = setTimeout(() => {
        confirmButtonRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoFocus, isLoading])

  const handleCancel = useCallback(() => {
    if (!isLoading) {
      onCancel()
    }
  }, [onCancel, isLoading])

  const handleConfirm = useCallback(async () => {
    if (isLoading) return

    try {
      setInternalLoading(true)
      await onConfirm()
    } catch (error) {
      console.error('Error en confirmación:', error)
    } finally {
      setInternalLoading(false)
    }
  }, [onConfirm, isLoading])

  // Manejar eventos de teclado
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        handleCancel()
      }
    }

    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isOpen && !isLoading) {
        handleConfirm()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleEnter)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleEnter)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isLoading, handleCancel, handleConfirm])

  // Click fuera del modal
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget && !isLoading) {
      handleCancel()
    }
  }, [closeOnOverlayClick, isLoading, handleCancel])

  const getButtonStyles = useCallback(() => {
    const baseStyles = 'w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
    
    switch (type) {
      case 'danger':
        return `${baseStyles} bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-200`
      case 'warning':
        return `${baseStyles} bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 shadow-yellow-200`
      case 'info':
        return `${baseStyles} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-blue-200`
      case 'success':
        return `${baseStyles} bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-green-200`
      default:
        return `${baseStyles} bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-200`
    }
  }, [type])

  const getIconStyles = useCallback(() => {
    const baseStyles = 'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 transition-all duration-300'
    
    switch (type) {
      case 'danger':
        return `${baseStyles} bg-red-100 text-red-600`
      case 'warning':
        return `${baseStyles} bg-yellow-100 text-yellow-600`
      case 'info':
        return `${baseStyles} bg-blue-100 text-blue-600`
      case 'success':
        return `${baseStyles} bg-green-100 text-green-600`
      default:
        return `${baseStyles} bg-red-100 text-red-600`
    }
  }, [type])

  const getIcon = useCallback(() => {
    switch (type) {
      case 'danger':
        return '⚠️'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      case 'success':
        return '✅'
      default:
        return '⚠️'
    }
  }, [type])

  const getSizeClasses = useCallback(() => {
    switch (size) {
      case 'sm':
        return 'sm:max-w-sm'
      case 'lg':
        return 'sm:max-w-2xl'
      default:
        return 'sm:max-w-lg'
    }
  }, [size])

  if (!isVisible) return null

  const isProcessing = isLoading || internalLoading
  const processingText = loadingText || 'Procesando...'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Fondo oscuro con animación */}
        <div 
          className={`fixed inset-0 bg-gray-900 transition-opacity duration-300 ${
            isAnimating ? 'bg-opacity-0' : 'bg-opacity-50'
          }`}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />

        {/* Modal con animación */}
        <div 
          ref={modalRef}
          className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-2xl transform transition-all duration-300 sm:my-8 sm:align-middle ${getSizeClasses()} sm:w-full ${
            isAnimating 
              ? 'scale-95 opacity-0 translate-y-4' 
              : 'scale-100 opacity-100 translate-y-0'
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          {/* Header del modal */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              {/* Icono */}
              <div className={getIconStyles()}>
                <span className={`text-2xl transition-transform duration-300 ${
                  isProcessing ? 'animate-pulse' : ''
                }`}>
                  {getIcon()}
                </span>
              </div>
              
              {/* Contenido */}
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 
                  id="modal-title"
                  className="text-lg leading-6 font-medium text-gray-900 transition-colors duration-200"
                >
                  {title}
                </h3>
                <div className="mt-2">
                  <p 
                    id="modal-description"
                    className="text-sm text-gray-500 leading-relaxed"
                  >
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer del modal */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {/* Botón de confirmar */}
            <button
              ref={confirmButtonRef}
              type="button"
              disabled={isProcessing}
              className={getButtonStyles()}
              onClick={handleConfirm}
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{processingText}</span>
                </div>
              ) : (
                confirmText
              )}
            </button>

            {/* Botón de cancelar */}
            {showCancelButton && (
              <button
                type="button"
                disabled={isProcessing}
                className="mt-3 w-full inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                onClick={handleCancel}
              >
                {cancelText}
              </button>
            )}
          </div>

          {/* Indicador de progreso sutil */}
          {isProcessing && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse transition-all duration-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 