'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import UserRoleManager from '@/components/admin/UserRoleManager'

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        if (data.role !== 'admin') {
          router.push('/')
          return
        }

        setIsAdmin(true)
      } catch (err) {
        console.error('Error al verificar rol de administrador:', err)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAdminRole()
  }, [user, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      <UserRoleManager />
    </div>
  )
} 