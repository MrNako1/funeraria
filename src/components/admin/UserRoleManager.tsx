'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

interface User {
  id: string
  email: string | undefined
  role: string
  full_name?: string
  created_at: string
}

interface AuthUser {
  id: string
  email: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user_metadata: any
  created_at: string
}

export default function UserRoleManager() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Obtener usuarios con roles usando la función get_users
      const { data: authUsers, error: usersError } = await supabase
        .rpc('get_users')
      
      if (usersError) {
        if (usersError.message === 'No tienes permisos de administrador') {
          throw new Error('No tienes permisos de administrador para ver esta página')
        }
        throw usersError
      }

      // Verificar que authUsers sea un array
      if (!authUsers || !Array.isArray(authUsers)) {
        throw new Error('Datos de usuarios inválidos')
      }

      // Obtener los roles de usuario
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
      
      if (rolesError) throw rolesError

      // Combinar los datos
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedUsers: User[] = (authUsers as any[]).map((userData: AuthUser) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const roleData = (rolesData as any[]).find((role: any) => role.user_id === userData.id)
        return {
          id: userData.id,
          email: userData.email || 'Sin email',
          role: roleData?.role || 'user',
          full_name: userData.user_metadata?.full_name,
          created_at: userData.created_at
        }
      })

      setUsers(formattedUsers)
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar la lista de usuarios')
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)

      const { error } = await supabase
        .from('user_roles')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ role: newRole } as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('user_id', userId as any)

      if (error) throw error

      setSuccessMessage('Rol actualizado correctamente')
      fetchUsers()
    } catch (err) {
      console.error('Error al actualizar rol:', err)
      setError('Error al actualizar el rol del usuario')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Gestión de Roles de Usuario</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
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
                  Fecha de Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cambiar Rol
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.full_name || 'Sin nombre'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      disabled={loading}
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
      )}
    </div>
  )
} 