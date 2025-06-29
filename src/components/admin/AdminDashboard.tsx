'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface DashboardStats {
  totalUsers: number
  adminUsers: number
  regularUsers: number
  verifiedUsers: number
  unverifiedUsers: number
  recentUsers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const adminUsers = roles.filter((role: any) => role.role === 'admin').length
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const regularUsers = roles.filter((role: any) => role.role === 'user').length
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const verifiedUsers = users.filter((user: any) => user.email_confirmed_at).length
        const unverifiedUsers = totalUsers - verifiedUsers
        
        // Usuarios registrados en los últimos 7 días
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recentUsers = users.filter((user: any) => 
          new Date(user.created_at) > sevenDaysAgo
        ).length

        setStats({
          totalUsers,
          adminUsers,
          regularUsers,
          verifiedUsers,
          unverifiedUsers,
          recentUsers
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statCards = [
    {
      title: 'Total de Usuarios',
      value: stats.totalUsers,
      color: 'bg-blue-500',
      icon: '👥'
    },
    {
      title: 'Administradores',
      value: stats.adminUsers,
      color: 'bg-purple-500',
      icon: '👑'
    },
    {
      title: 'Usuarios Regulares',
      value: stats.regularUsers,
      color: 'bg-green-500',
      icon: '👤'
    },
    {
      title: 'Emails Verificados',
      value: stats.verifiedUsers,
      color: 'bg-emerald-500',
      icon: '✅'
    },
    {
      title: 'Emails Pendientes',
      value: stats.unverifiedUsers,
      color: 'bg-yellow-500',
      icon: '⏳'
    },
    {
      title: 'Nuevos (7 días)',
      value: stats.recentUsers,
      color: 'bg-orange-500',
      icon: '🆕'
    }
  ]

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Estadísticas Generales</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 