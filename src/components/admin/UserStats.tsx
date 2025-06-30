'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { User } from '@supabase/supabase-js'

interface UserWithRole extends User {
  role: string
}

interface UserStatsProps {
  users: UserWithRole[]
  filteredCount: number
  isLoading?: boolean
  previousUsers?: UserWithRole[]
}

interface StatCardProps {
  title: string
  value: number
  previousValue?: number
  percentage: number
  icon: string
  color: string
  isLoading?: boolean
  showChange?: boolean
}

// Hook personalizado para animación de contador
function useCounterAnimation(targetValue: number, duration: number = 1000) {
  const [displayValue, setDisplayValue] = useState(targetValue)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (displayValue === targetValue) return

    setIsAnimating(true)
    const startValue = displayValue
    const change = targetValue - startValue
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Función de easing para animación suave
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = startValue + (change * easeOutQuart)
      
      setDisplayValue(Math.round(currentValue))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [targetValue, duration, displayValue])

  return { displayValue, isAnimating }
}

function StatCard({ 
  title, 
  value, 
  previousValue, 
  percentage, 
  icon, 
  color, 
  isLoading = false,
  showChange = true 
}: StatCardProps) {
  const { displayValue, isAnimating } = useCounterAnimation(value, 800)
  const [isHovered, setIsHovered] = useState(false)

  const getChangeIndicator = () => {
    if (!showChange || previousValue === undefined || previousValue === value) return null
    
    const change = value - previousValue
    
    return (
      <div className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
        change > 0 
          ? 'bg-green-100 text-green-800' 
          : change < 0 
          ? 'bg-red-100 text-red-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {change > 0 ? '+' : ''}{change}
      </div>
    )
  }

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' },
      red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' }
    }
    return colorMap[color] || colorMap.blue
  }

  const colorClasses = getColorClasses(color)

  return (
    <div 
      className={`relative bg-white rounded-lg shadow-sm p-4 border transition-all duration-300 transform hover:scale-105 hover:shadow-md ${
        colorClasses.border
      } ${isAnimating ? 'ring-2 ring-blue-200' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {getChangeIndicator()}
      
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 ${colorClasses.bg} rounded-full flex items-center justify-center transition-all duration-300 ${
            isHovered ? 'scale-110 rotate-3' : ''
          }`}>
            <span className={`${colorClasses.text} text-sm font-semibold transition-transform duration-300 ${
              isAnimating ? 'scale-110' : ''
            }`}>
              {icon}
            </span>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {isLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mt-1"></div>
          ) : (
            <p className={`text-2xl font-bold transition-all duration-300 ${
              isAnimating ? 'text-blue-600' : 'text-gray-900'
            }`}>
              {displayValue.toLocaleString()}
            </p>
          )}
          <p className={`text-xs transition-colors duration-300 ${
            isAnimating ? 'text-blue-600 font-medium' : 'text-gray-500'
          }`}>
            {percentage.toFixed(1)}%
          </p>
        </div>
      </div>
      
      {/* Barra de progreso sutil */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${colorClasses.bg.replace('bg-', 'bg-')}`}
          style={{ 
            width: `${Math.min(percentage, 100)}%`,
            opacity: isAnimating ? 0.8 : 0.6
          }}
        />
      </div>
    </div>
  )
}

export default function UserStats({ 
  users, 
  filteredCount, 
  isLoading = false,
  previousUsers 
}: UserStatsProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const animationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Calcular estadísticas actuales
  const currentStats = useMemo(() => {
    const totalUsers = users.length
    const adminUsers = users.filter(user => user.role === 'admin').length
    const regularUsers = users.filter(user => user.role === 'user').length
    const verifiedUsers = users.filter(user => user.email_confirmed_at).length
    const pendingUsers = totalUsers - verifiedUsers

    return {
      total: totalUsers,
      admins: adminUsers,
      regular: regularUsers,
      verified: verifiedUsers,
      pending: pendingUsers
    }
  }, [users])

  // Calcular estadísticas anteriores
  const previousStats = useMemo(() => {
    if (!previousUsers) return null

    const totalUsers = previousUsers.length
    const adminUsers = previousUsers.filter(user => user.role === 'admin').length
    const regularUsers = previousUsers.filter(user => user.role === 'user').length
    const verifiedUsers = previousUsers.filter(user => user.email_confirmed_at).length
    const pendingUsers = totalUsers - verifiedUsers

    return {
      total: totalUsers,
      admins: adminUsers,
      regular: regularUsers,
      verified: verifiedUsers,
      pending: pendingUsers
    }
  }, [previousUsers])

  // Animación cuando cambian las estadísticas
  useEffect(() => {
    if (previousStats && (
      currentStats.total !== previousStats.total ||
      currentStats.admins !== previousStats.admins ||
      currentStats.regular !== previousStats.regular ||
      currentStats.verified !== previousStats.verified ||
      currentStats.pending !== previousStats.pending
    )) {
      setIsAnimating(true)
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
      animationTimeoutRef.current = setTimeout(() => setIsAnimating(false), 1000)
    }
  }, [currentStats, previousStats])

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // Calcular porcentajes
  const percentages = useMemo(() => ({
    total: 100,
    admins: currentStats.total > 0 ? (currentStats.admins / currentStats.total) * 100 : 0,
    regular: currentStats.total > 0 ? (currentStats.regular / currentStats.total) * 100 : 0,
    verified: currentStats.total > 0 ? (currentStats.verified / currentStats.total) * 100 : 0,
    pending: currentStats.total > 0 ? (currentStats.pending / currentStats.total) * 100 : 0
  }), [currentStats])

  // Configuración de las tarjetas de estadísticas
  const statCards = useMemo(() => [
    {
      title: 'Total Usuarios',
      value: currentStats.total,
      previousValue: previousStats?.total,
      percentage: percentages.total,
      icon: '👥',
      color: 'blue'
    },
    {
      title: 'Administradores',
      value: currentStats.admins,
      previousValue: previousStats?.admins,
      percentage: percentages.admins,
      icon: '👑',
      color: 'purple'
    },
    {
      title: 'Usuarios',
      value: currentStats.regular,
      previousValue: previousStats?.regular,
      percentage: percentages.regular,
      icon: '👤',
      color: 'green'
    },
    {
      title: 'Verificados',
      value: currentStats.verified,
      previousValue: previousStats?.verified,
      percentage: percentages.verified,
      icon: '✅',
      color: 'green'
    },
    {
      title: 'Pendientes',
      value: currentStats.pending,
      previousValue: previousStats?.pending,
      percentage: percentages.pending,
      icon: '⏳',
      color: 'yellow'
    }
  ], [currentStats, previousStats, percentages])

  // Estadísticas de rendimiento
  const performanceStats = useMemo(() => {
    const total = currentStats.total
    const verifiedPercentage = total > 0 ? Math.round((currentStats.verified / total) * 100) : 0
    const adminPercentage = total > 0 ? Math.round((currentStats.admins / total) * 100) : 0
    const pendingPercentage = total > 0 ? Math.round((currentStats.pending / total) * 100) : 0
    
    return { verifiedPercentage, adminPercentage, pendingPercentage }
  }, [currentStats])

  if (isLoading && !users.length) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 animate-pulse">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mt-1"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <StatCard
            key={`${index}-${currentStats.total}-${currentStats.admins}`}
            title={stat.title}
            value={stat.value}
            previousValue={stat.previousValue}
            percentage={stat.percentage}
            icon={stat.icon}
            color={stat.color}
            isLoading={isLoading}
            showChange={!!previousStats}
          />
        ))}
      </div>

      {/* Indicadores de rendimiento */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">{performanceStats.verifiedPercentage}%</div>
            <div className="text-xs text-blue-700">Verificados</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">{performanceStats.adminPercentage}%</div>
            <div className="text-xs text-purple-700">Administradores</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">{performanceStats.pendingPercentage}%</div>
            <div className="text-xs text-orange-700">Pendientes</div>
          </div>
        </div>
      </div>

      {/* Información de filtrado */}
      {filteredCount !== currentStats.total && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-center text-sm text-yellow-800">
            <span className="mr-2">🔍</span>
            <span>
              Mostrando {filteredCount.toLocaleString()} de {currentStats.total.toLocaleString()} usuarios 
              ({Math.round((filteredCount / currentStats.total) * 100)}%)
            </span>
          </div>
        </div>
      )}

      {/* Indicador de animación */}
      {isAnimating && (
        <div className="flex items-center justify-center text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="ml-2">Actualizando estadísticas...</span>
        </div>
      )}
    </div>
  )
} 