'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { QrCodeIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface MemorialQRProps {
  memorialId: string
  className?: string
}

// Hook personalizado para obtener la URL base
function useBaseUrl() {
  const [baseUrl, setBaseUrl] = useState<string>('')

  useEffect(() => {
    // Asegurarse de que estamos en el cliente
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin)
    }
  }, [])

  return baseUrl
}

export default function MemorialQR({ memorialId, className = '' }: MemorialQRProps) {
  const baseUrl = useBaseUrl()
  const [memorialUrl, setMemorialUrl] = useState<string>('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (baseUrl) {
      setMemorialUrl(`${baseUrl}/memorial/${memorialId}`)
    }
  }, [baseUrl, memorialId])

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  if (!memorialUrl) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className="mb-4 bg-white p-4 rounded-lg shadow-lg w-[200px] h-[200px] flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 w-full h-full rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        onClick={toggleVisibility}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 transition-all duration-200"
      >
        {isVisible ? (
          <>
            <XMarkIcon className="h-5 w-5" />
            Ocultar QR
          </>
        ) : (
          <>
            <QrCodeIcon className="h-5 w-5" />
            Mostrar QR
          </>
        )}
      </button>

      {isVisible && (
        <div className="mb-4 bg-white p-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out">
          <QRCodeSVG
            value={memorialUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
          <p className="text-sm text-gray-600 text-center mt-2">
            Escanea este código QR para acceder al memorial
          </p>
        </div>
      )}
    </div>
  )
} 