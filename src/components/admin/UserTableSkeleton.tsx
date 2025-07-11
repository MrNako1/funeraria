'use client'

import { useState, useEffect, useMemo } from 'react'

interface UserTableSkeletonProps {
  rows?: number
  showHeader?: boolean
  showFooter?: boolean
  variant?: 'default' | 'compact' | 'detailed'
  animationSpeed?: 'slow' | 'normal' | 'fast'
  shimmerEffect?: boolean
}

interface SkeletonCellProps {
  type: 'avatar' | 'text' | 'badge' | 'button' | 'email' | 'date' | 'status'
  width?: string
  height?: string
  delay?: number
  shimmerEffect?: boolean
}

// Componente de celda de skeleton con animación escalonada
function SkeletonCell({ type, width = 'w-32', height = 'h-4', delay = 0, shimmerEffect = true }: SkeletonCellProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const getCellContent = () => {
    switch (type) {
      case 'avatar':
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className={`h-10 w-10 rounded-full bg-gray-200 ${shimmerEffect ? 'animate-pulse' : ''} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}></div>
            </div>
            <div className="ml-4">
              <div className={`h-4 bg-gray-200 rounded w-24 ${shimmerEffect ? 'animate-pulse' : ''} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 mb-1`}></div>
              <div className={`h-3 bg-gray-200 rounded w-16 ${shimmerEffect ? 'animate-pulse' : ''} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}></div>
            </div>
          </div>
        )
      
      case 'badge':
        return (
          <div className={`h-6 bg-gray-200 rounded-full ${width} ${shimmerEffect ? 'animate-pulse' : ''} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}></div>
        )
      
      case 'button':
        return (
          <div className="flex space-x-2">
            <div className={`h-8 bg-gray-200 rounded w-20 ${shimmerEffect ? 'animate-pulse' : ''} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}></div>
            <div className={`h-8 bg-gray-200 rounded w-8 ${shimmerEffect ? 'animate-pulse' : ''} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}></div>
          </div>
        )
      
      case 'email':
        return (
          <div className={`h-4 bg-gray-200 rounded w-40 ${shimmerEffect ? 'animate-pulse' : ''} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}></div>
        )
      
      case 'date':
        return (
          <div className={`h-4 bg-gray-200 rounded w-24 ${shimmerEffect ? 'animate-pulse' : ''} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}></div>
        )
      
      case 'status':
        return (
          <div className={`h-6 bg-gray-200 rounded-full w-16 ${shimmerEffect ? 'animate-pulse' : ''} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}></div>
        )
      
      default:
        return (
          <div className={`${height} bg-gray-200 rounded ${width} ${shimmerEffect ? 'animate-pulse' : ''} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}></div>
        )
    }
  }

  return getCellContent()
}

// Componente de shimmer overlay
function ShimmerOverlay() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
  )
}

export default function UserTableSkeleton({ 
  rows = 5, 
  showHeader = true, 
  showFooter = true,
  variant = 'default',
  animationSpeed = 'normal',
  shimmerEffect = true 
}: UserTableSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentRow, setCurrentRow] = useState(0)

  // Configuraciones según el variant
  const config = useMemo(() => {
    const configs = {
      default: {
        headerHeight: 'h-6',
        cellHeight: 'h-4',
        avatarSize: 'h-10 w-10',
        rowPadding: 'py-4'
      },
      compact: {
        headerHeight: 'h-5',
        cellHeight: 'h-3',
        avatarSize: 'h-8 w-8',
        rowPadding: 'py-2'
      },
      detailed: {
        headerHeight: 'h-7',
        cellHeight: 'h-5',
        avatarSize: 'h-12 w-12',
        rowPadding: 'py-6'
      }
    }
    return configs[variant]
  }, [variant])

  // Configuración de velocidad de animación
  const animationConfig = useMemo(() => {
    const speeds = {
      slow: { duration: 2000, delay: 300 },
      normal: { duration: 1000, delay: 150 },
      fast: { duration: 500, delay: 75 }
    }
    return speeds[animationSpeed]
  }, [animationSpeed])

  // Configuración de columnas según el variant
  const columnConfig = useMemo(() => {
    const configs = {
      default: [
        { type: 'avatar' as const, width: 'w-48' },
        { type: 'email' as const, width: 'w-40' },
        { type: 'text' as const, width: 'w-24' },
        { type: 'badge' as const, width: 'w-16' },
        { type: 'badge' as const, width: 'w-16' },
        { type: 'button' as const, width: 'w-32' }
      ],
      compact: [
        { type: 'avatar' as const, width: 'w-32' },
        { type: 'email' as const, width: 'w-32' },
        { type: 'text' as const, width: 'w-20' },
        { type: 'badge' as const, width: 'w-12' },
        { type: 'button' as const, width: 'w-24' }
      ],
      detailed: [
        { type: 'avatar' as const, width: 'w-56' },
        { type: 'email' as const, width: 'w-48' },
        { type: 'text' as const, width: 'w-32' },
        { type: 'date' as const, width: 'w-28' },
        { type: 'status' as const, width: 'w-20' },
        { type: 'badge' as const, width: 'w-20' },
        { type: 'button' as const, width: 'w-40' }
      ]
    }
    return configs[variant]
  }, [variant])

  // Efecto para simular carga progresiva
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Efecto para animación de filas progresivas
  useEffect(() => {
    if (!isLoaded) return

    const interval = setInterval(() => {
      setCurrentRow(prev => {
        if (prev < rows - 1) {
          return prev + 1
        } else {
          clearInterval(interval)
          return prev
        }
      })
    }, animationConfig.delay)

    return () => clearInterval(interval)
  }, [isLoaded, rows, animationConfig.delay])

  // Generar filas de skeleton
  const skeletonRows = useMemo(() => {
    return Array.from({ length: rows }, (_, rowIndex) => ({
      id: rowIndex,
      isVisible: rowIndex <= currentRow,
      delay: rowIndex * animationConfig.delay
    }))
  }, [rows, currentRow, animationConfig.delay])

  // Generar headers de skeleton
  const skeletonHeaders = useMemo(() => {
    return columnConfig.map((col, index) => ({
      id: index,
      type: col.type,
      width: col.width,
      delay: index * 50
    }))
  }, [columnConfig])

  return (
    <div className="w-full">
      {/* Header */}
      {showHeader && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="px-6 py-3">
            <div className="grid grid-cols-6 gap-4">
              {skeletonHeaders.map((header) => (
                <div key={header.id} className="relative overflow-hidden">
                  <div 
                    className={`${config.headerHeight} bg-gray-200 rounded ${header.width} animate-pulse`}
                    style={{ animationDelay: `${header.delay}ms` }}
                  ></div>
                  {shimmerEffect && <ShimmerOverlay />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="bg-white divide-y divide-gray-200">
        {skeletonRows.map((row) => (
          <div 
            key={row.id} 
            className={`px-6 ${config.rowPadding} ${row.isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
            style={{ transitionDelay: `${row.delay}ms` }}
          >
            <div className="grid grid-cols-6 gap-4">
              {columnConfig.map((col, colIndex) => (
                <div key={colIndex} className="relative overflow-hidden">
                  <SkeletonCell
                    type={col.type}
                    width={col.width}
                    height={config.cellHeight}
                    delay={row.delay + (colIndex * 20)}
                    shimmerEffect={shimmerEffect}
                  />
                  {shimmerEffect && <ShimmerOverlay />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS para la animación shimmer */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
} 