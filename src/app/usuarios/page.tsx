'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface UserWithRole extends User {
  role: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const { } = useAuth()

  useEffect(() => {
    const checkSessionAndFetchUsers = async () => {
      try {
        // Verificar la sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError
        
        if (!session) {
          router.push('/auth')
          return
        }

        // Verificar si el usuario tiene rol de admin
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (roleError || !roleData || roleData.role !== 'admin') {
          throw new Error('No tienes permisos de administrador')
        }

        // Si todo está bien, obtener los usuarios
        await fetchUsers()
      } catch (error: unknown) {
        console.error('Error checking session:', error)
        if (error instanceof Error && error.message === 'No tienes permisos de administrador') {
          router.push('/')
        } else {
          router.push('/auth')
        }
      }
    }

    checkSessionAndFetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // Obtener los datos de usuarios usando la función get_users
      const { data: authUsers, error: usersError } = await supabase
        .rpc('get_users')
      
      if (usersError) {
        if (usersError.message === 'No tienes permisos de administrador') {
          throw new Error('No tienes permisos de administrador para ver esta página')
        }
        throw usersError
      }

      // Obtener los roles de usuario
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
      
      if (rolesError) throw rolesError

      // Combinar los datos y asegurar que cumplan con el tipo UserWithRole
      const formattedUsers: UserWithRole[] = authUsers
        .map((userData: User) => {
          const roleData = rolesData.find((role: { id: string; role: string }) => role.id === userData.id)
          return {
            ...userData,
            role: roleData?.role || 'user', // Si no tiene rol asignado, por defecto es 'user'
            id: userData.id
          } as UserWithRole
        })

      setUsers(formattedUsers)
    } catch (error: unknown) {
      console.error('Error fetching users:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar los usuarios'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId)

      if (error) throw error

      // Actualizar el estado local
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración de Usuarios</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cambiar Rol
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.user_metadata?.full_name || 'Sin nombre'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}