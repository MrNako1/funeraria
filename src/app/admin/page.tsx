'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import AdminDashboard from '@/components/admin/AdminDashboard'
import Notification from '@/components/admin/Notification'
import AuthDebug from '@/components/admin/AuthDebug'

interface UserWithRole extends User {
  role: string
}

interface NotificationState {
  message: string
  type: 'success' | 'error' | 'info'
  show: boolean
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    show: false
  })
  const supabase = createClientComponentClient()
  const router = useRouter()
  const { user, userRole, loading: authLoading, signOut } = useAuth()

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type, show: true })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }))
  }

  const handleLogout = async () => {
    try {
      console.log('🔄 Logout desde página de admin...');
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      alert('Error al cerrar sesión');
    }
  }

  const fetchUsers = useCallback(async () => {
    try {
      setError(null)
      console.log('Iniciando fetchUsers...')
      
      // Obtener los datos de usuarios usando la función get_users
      const { data: authUsers, error: usersError } = await supabase
        .rpc('get_users')
      
      console.log('Respuesta de get_users:', { authUsers, usersError })
      
      if (usersError) {
        console.error('Error en get_users:', usersError)
        if (usersError.message === 'No tienes permisos de administrador') {
          throw new Error('No tienes permisos de administrador para ver esta página')
        }
        throw usersError
      }

      if (!authUsers || authUsers.length === 0) {
        console.log('No se encontraron usuarios')
        setUsers([])
        return
      }

      // Obtener los roles de usuario
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
      
      console.log('Roles obtenidos:', rolesData)
      
      if (rolesError) {
        console.error('Error obteniendo roles:', rolesError)
        throw rolesError
      }

      // Combinar los datos
      const formattedUsers: UserWithRole[] = authUsers
        .map((userData: User) => {
          const roleData = rolesData?.find((role: { user_id: string; role: string }) => role.user_id === userData.id)
          return {
            ...userData,
            role: roleData?.role || 'user',
            id: userData.id
          } as UserWithRole
        })

      console.log('Usuarios formateados:', formattedUsers)
      setUsers(formattedUsers)
    } catch (error: unknown) {
      console.error('Error fetching users:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar los usuarios'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    console.log('🔍 Estado de autenticación:', { user, userRole, authLoading })
    
    // Esperar a que la autenticación termine de cargar
    if (authLoading) {
      console.log('⏳ Esperando que termine la carga de autenticación...')
      return
    }

    // Si no hay usuario, redirigir a login
    if (!user) {
      console.log('❌ No hay usuario autenticado, redirigiendo a /auth')
      router.push('/auth')
      return
    }

    // Si el usuario no es admin, redirigir al inicio
    if (userRole !== 'admin') {
      console.log('❌ Usuario no es admin, redirigiendo a /')
      router.push('/')
      return
    }

    // Si todo está bien, cargar usuarios
    console.log('✅ Usuario autenticado y es admin, cargando usuarios...')
    fetchUsers()
  }, [user, userRole, authLoading, fetchUsers, router])

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

      // Mostrar notificación de éxito
      showNotification('Rol actualizado correctamente', 'success')
    } catch (error) {
      console.error('Error updating user role:', error)
      showNotification('Error al actualizar el rol del usuario', 'error')
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      // Primero eliminar el rol del usuario
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      if (roleError) throw roleError

      // Luego eliminar el usuario de auth
      const { error: userError } = await supabase.auth.admin.deleteUser(userId)

      if (userError) throw userError

      // Actualizar el estado local
      setUsers(users.filter(user => user.id !== userId))

      showNotification('Usuario eliminado correctamente', 'success')
    } catch (error) {
      console.error('Error deleting user:', error)
      showNotification('Error al eliminar el usuario', 'error')
    }
  }

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Mostrar loading mientras se cargan los usuarios
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  // Mostrar error si hay alguno
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <strong className="font-bold block mb-2">Error de Acceso</strong>
          <span className="block">{error}</span>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Componente de debug temporal */}
      <AuthDebug />
      
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Administra todos los usuarios registrados en la plataforma
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Total: <span className="font-semibold text-gray-900">{users.length}</span> usuarios
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard de estadísticas compacto */}
          <div className="mb-8">
            <AdminDashboard />
          </div>
          
          {/* Lista de usuarios */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Lista de Usuarios Registrados</h2>
            </div>
            
            {users.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">No se encontraron usuarios</p>
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
                        Fecha de Registro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {user.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 
                                   user.email?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.user_metadata?.full_name || 'Sin nombre'}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {user.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.email_confirmed_at 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.email_confirmed_at ? 'Verificado' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value)}
                              className="block w-full pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="user">Usuario</option>
                              <option value="admin">Administrador</option>
                            </select>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                              title="Eliminar usuario"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  Mostrando <span className="font-medium">{users.length}</span> usuarios
                </div>
                <div>
                  Última actualización: {new Date().toLocaleString('es-ES')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 