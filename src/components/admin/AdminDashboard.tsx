'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface DashboardStats {
  totalUsers: number
  adminUsers: number
  regularUsers: number
  verifiedUsers: number
  unverifiedUsers: number
  recentUsers: number
  lastUpdated: Date
}

interface StatCardProps {
  title: string
  value: number
  previousValue?: number
  color: string
  icon: string
  isLoading?: boolean
  trend?: {
    value: number
    isPositive: boolean
  }
  showChange?: boolean
}

// Hook personalizado para animación de contador
function useCounterAnimation(targetValue: number, duration: number = 1000) {
  const [displayValue, setDisplayValue] = useState(targetValue ?? 0)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (displayValue === targetValue) return

    setIsAnimating(true)
    const startValue = displayValue
    const change = (targetValue ?? 0) - startValue
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
  color, 
  icon, 
  isLoading = false, 
  trend, 
  showChange = true 
}: StatCardProps) {
  const { displayValue, isAnimating } = useCounterAnimation(value, 800)
  const [isHovered, setIsHovered] = useState(false)

  const getChangeIndicator = () => {
    if (!showChange || previousValue === undefined || previousValue === value) return null
    
    const change = value - previousValue
    const changePercent = previousValue > 0 ? Math.round((change / previousValue) * 100) : 0
    
    return (
      <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium ${change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {change > 0 ? '+' : ''}{change} ({changePercent > 0 ? '+' : ''}{changePercent}%)
      </div>
    )
  }

  return (
    <div 
      className={`relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${color}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {getChangeIndicator()}
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {isLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
          ) : (
            <div className="flex items-baseline">
              <p className={`text-3xl font-bold text-gray-900 transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
                {displayValue.toLocaleString()}
              </p>
              {trend && (
                <span className={`ml-2 text-sm font-medium transition-all duration-300 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? '↗' : '↘'} {trend.value}%
                </span>
              )}
            </div>
          )}
        </div>
        <div className={`${color} p-3 rounded-full shadow-lg transform transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      
      {/* Barra de progreso sutil */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${color.replace('bg-', 'bg-').replace('text-', 'bg-')}`}
          style={{ 
            width: `${Math.min((value / Math.max(value, 1)) * 100, 100)}%`,
            opacity: isAnimating ? 0.8 : 0.6
          }}
        />
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [previousStats, setPreviousStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const refreshInterval = 30000 // 30 segundos
  const supabase = createClientComponentClient()

  const fetchStats = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true)
      }
      setError(null)

      // Guardar estadísticas anteriores para comparación
      if (stats) {
        setPreviousStats(stats)
      }

      // Obtener todos los usuarios
      const { data: users, error: usersError } = await supabase
        .rpc('get_users')
      
      if (usersError) throw usersError

      // Obtener roles de usuarios
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
      
      if (rolesError) throw rolesError

      // Calcular estadísticas
      const totalUsers = users.length
      const adminUsers = roles.filter((role: { role: string }) => role.role === 'admin').length
      const regularUsers = roles.filter((role: { role: string }) => role.role === 'user').length
      const verifiedUsers = users.filter((user: { email_confirmed_at: string | null }) => user.email_confirmed_at).length
      const unverifiedUsers = totalUsers - verifiedUsers
      
      // Usuarios registrados en los últimos 7 días
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentUsers = users.filter((user: { created_at: string }) => 
        new Date(user.created_at) > sevenDaysAgo
      ).length

      const newStats: DashboardStats = {
        totalUsers,
        adminUsers,
        regularUsers,
        verifiedUsers,
        unverifiedUsers,
        recentUsers,
        lastUpdated: new Date()
      }

      setStats(newStats)
      setLastRefresh(new Date())
      setRefreshCount(prev => prev + 1)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError(error instanceof Error ? error.message : 'Error al cargar estadísticas')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [supabase, stats])

  // Auto-refresh configurable
  useEffect(() => {
    if (!autoRefreshEnabled) return

    fetchStats()

    const interval = setInterval(() => {
      fetchStats()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchStats, autoRefreshEnabled, refreshInterval])

  const handleManualRefresh = useCallback(() => {
    fetchStats(true)
  }, [fetchStats])

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled(prev => !prev)
  }, [])

  // Calcular tendencias
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true }
    const change = ((current - previous) / previous) * 100
    return { value: Math.round(change), isPositive: change >= 0 }
  }

  // Estadísticas de rendimiento
  const performanceStats = useMemo(() => {
    if (!stats) return null

    return {
      verifiedPercentage: stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0,
      adminPercentage: stats.totalUsers > 0 ? Math.round((stats.adminUsers / stats.totalUsers) * 100) : 0,
      recentPercentage: stats.totalUsers > 0 ? Math.round((stats.recentUsers / stats.totalUsers) * 100) : 0
    }
  }, [stats])

  // Preparar tarjetas de estadísticas
  const statCards = useMemo(() => {
    if (!stats) return []

    return [
      {
        title: 'Total de Usuarios',
        value: stats.totalUsers,
        previousValue: previousStats?.totalUsers,
        color: 'bg-blue-50 text-blue-600',
        icon: '👥',
        trend: previousStats ? calculateTrend(stats.totalUsers, previousStats.totalUsers) : undefined
      },
      {
        title: 'Administradores',
        value: stats.adminUsers,
        previousValue: previousStats?.adminUsers,
        color: 'bg-purple-50 text-purple-600',
        icon: '👑',
        trend: previousStats ? calculateTrend(stats.adminUsers, previousStats.adminUsers) : undefined
      },
      {
        title: 'Usuarios Regulares',
        value: stats.regularUsers,
        previousValue: previousStats?.regularUsers,
        color: 'bg-green-50 text-green-600',
        icon: '👤',
        trend: previousStats ? calculateTrend(stats.regularUsers, previousStats.regularUsers) : undefined
      },
      {
        title: 'Emails Verificados',
        value: stats.verifiedUsers,
        previousValue: previousStats?.verifiedUsers,
        color: 'bg-emerald-50 text-emerald-600',
        icon: '✅',
        trend: previousStats ? calculateTrend(stats.verifiedUsers, previousStats.verifiedUsers) : undefined
      },
      {
        title: 'Emails Pendientes',
        value: stats.unverifiedUsers,
        previousValue: previousStats?.unverifiedUsers,
        color: 'bg-yellow-50 text-yellow-600',
        icon: '⏳',
        trend: previousStats ? calculateTrend(stats.unverifiedUsers, previousStats.unverifiedUsers) : undefined
      },
      {
        title: 'Nuevos (7 días)',
        value: stats.recentUsers,
        previousValue: previousStats?.recentUsers,
        color: 'bg-orange-50 text-orange-600',
        icon: '🆕',
        trend: previousStats ? calculateTrend(stats.recentUsers, previousStats.recentUsers) : undefined
      }
    ]
  }, [stats, previousStats])

  // Loading state
  if (loading && !stats) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Estadísticas Generales</h2>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Estadísticas Generales</h2>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
          >
            {isRefreshing ? '🔄' : '🔄'} Actualizar
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-lg">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error al cargar estadísticas</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Estadísticas Generales</h2>
        <div className="flex items-center space-x-3">
          <div className="text-xs text-gray-500">
            Última actualización: {lastRefresh.toLocaleTimeString('es-ES')}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAutoRefresh}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                autoRefreshEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
              title={autoRefreshEnabled ? 'Auto-refresh activado' : 'Auto-refresh desactivado'}
            >
              {autoRefreshEnabled ? '🔄' : '⏸️'}
            </button>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <span className={isRefreshing ? 'animate-spin' : ''}>
                {isRefreshing ? '🔄' : '🔄'}
              </span>
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Indicadores de rendimiento */}
      {performanceStats && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
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
              <div className="text-lg font-bold text-orange-600">{performanceStats.recentPercentage}%</div>
              <div className="text-xs text-orange-700">Nuevos (7 días)</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            previousValue={stat.previousValue}
            color={stat.color}
            icon={stat.icon}
            trend={stat.trend}
            showChange={!!previousStats}
          />
        ))}
      </div>
      
      {/* Footer con información adicional */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Actualizaciones automáticas cada {refreshInterval / 1000} segundos  
        Total de actualizaciones: {refreshCount}
      </div>
    </div>
  )
} 