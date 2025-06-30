'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useDebounce } from '@/hooks/useDebounce'
import AdminDashboard from '@/components/admin/AdminDashboard'
import UserStats from '@/components/admin/UserStats'
import Notification from '@/components/admin/Notification'
import AuthDebug from '@/components/admin/AuthDebug'
import ConfirmModal from '@/components/admin/ConfirmModal'
import UserTableSkeleton from '@/components/admin/UserTableSkeleton'

interface UserWithRole extends User {
  role: string
}

interface NotificationState {
  message: string
  type: 'success' | 'error' | 'info'
  show: boolean
}

interface LoadingStates {
  [userId: string]: {
    roleUpdate: boolean
    delete: boolean
  }
}

interface ConfirmModalState {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  userId?: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({})
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    show: false
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at' | 'role'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })
  
  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  const supabase = createClientComponentClient()
  const router = useRouter()
  const { user, userRole, loading: authLoading, signOut } = useAuth()

  // Memoizar usuarios filtrados y ordenados
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter(user => 
      user.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.user_metadata?.full_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )

    return filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number
      
      switch (sortBy) {
        case 'name':
          aValue = a.user_metadata?.full_name || ''
          bValue = b.user_metadata?.full_name || ''
          break
        case 'email':
          aValue = a.email || ''
          bValue = b.email || ''
          break
        case 'created_at':
          aValue = new Date(a.created_at || '').getTime()
          bValue = new Date(b.created_at || '').getTime()
          break
        case 'role':
          aValue = a.role
          bValue = b.role
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [users, debouncedSearchTerm, sortBy, sortOrder])

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type, show: true })
    // Auto-hide notifications after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }))
    }, 5000)
  }, [])

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }))
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      console.log('🔄 Logout desde página de admin...');
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      showNotification('Error al cerrar sesión', 'error');
    }
  }, [signOut, router, showNotification])

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

  const updateUserRole = useCallback(async (userId: string, newRole: string) => {
    // Optimistic update
    const previousUsers = [...users]
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ))

    // Set loading state for this specific user
    setLoadingStates(prev => ({
      ...prev,
      [userId]: { ...prev[userId], roleUpdate: true }
    }))

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId)

      if (error) throw error

      showNotification('Rol actualizado correctamente', 'success')
    } catch (error) {
      console.error('Error updating user role:', error)
      // Revert optimistic update on error
      setUsers(previousUsers)
      showNotification('Error al actualizar el rol del usuario', 'error')
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({
        ...prev,
        [userId]: { ...prev[userId], roleUpdate: false }
      }))
    }
  }, [users, supabase, showNotification])

  const deleteUser = useCallback(async (userId: string) => {
    // Cerrar modal
    setConfirmModal(prev => ({ ...prev, isOpen: false }))

    // Set loading state for this specific user
    setLoadingStates(prev => ({
      ...prev,
      [userId]: { ...prev[userId], delete: true }
    }))

    try {
      console.log('🗑️ Iniciando eliminación del usuario:', userId)

      // 1. Eliminar favoritos del usuario
      const { error: favoritesError } = await supabase
        .from('memorial_favorites')
        .delete()
        .eq('user_id', userId)

      if (favoritesError) {
        console.error('Error eliminando favoritos:', favoritesError)
        // Continuar aunque falle, no es crítico
      } else {
        console.log('✅ Favoritos eliminados')
      }

      // 2. Eliminar rol del usuario
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      if (roleError) {
        console.error('Error eliminando rol:', roleError)
        throw roleError
      } else {
        console.log('✅ Rol eliminado')
      }

      // 3. Intentar usar la función RPC delete_user_account si está disponible
      try {
        const { data: deleteResult, error: rpcError } = await supabase
          .rpc('delete_user_account', { target_user_id: userId })

        if (rpcError) {
          console.log('⚠️ Función RPC no disponible o falló:', rpcError.message)
          // Continuar sin la función RPC
        } else if (deleteResult) {
          console.log('✅ Función RPC exitosa')
        }
      } catch (rpcError) {
        console.log('⚠️ Error en función RPC:', rpcError)
        // Continuar sin la función RPC
      }

      // 4. Actualizar el estado local
      setUsers(prev => prev.filter(user => user.id !== userId))
      console.log('✅ Estado local actualizado')

      // 5. Mostrar mensaje de éxito
      showNotification('Usuario eliminado correctamente (datos de la aplicación eliminados)', 'success')

    } catch (error) {
      console.error('❌ Error general eliminando usuario:', error)
      showNotification('Error al eliminar el usuario', 'error')
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({
        ...prev,
        [userId]: { ...prev[userId], delete: false }
      }))
    }
  }, [supabase, showNotification])

  const showDeleteConfirmation = (userId: string, userName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de que quieres eliminar al usuario "${userName}"? Esta acción no se puede deshacer y eliminará permanentemente todos los datos asociados.`,
      onConfirm: () => deleteUser(userId),
      userId
    })
  }

  const handleSort = useCallback((field: 'name' | 'email' | 'created_at' | 'role') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }, [sortBy])

  const refreshUsers = useCallback(() => {
    setLoading(true)
    fetchUsers()
  }, [fetchUsers])

  const closeConfirmModal = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }))
  }, [])

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
                  Total: <span className="font-semibold text-gray-900">...</span> usuarios
                </div>
                <button
                  disabled
                  className="bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                >
                  🔄 Actualizar
                </button>
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
          
          {/* Skeleton para estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="ml-4">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse mb-1"></div>
                    <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Skeleton para filtros */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse mb-2"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Skeleton para tabla */}
          <UserTableSkeleton />
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

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
        type="danger"
        confirmText="Eliminar Usuario"
        cancelText="Cancelar"
      />
      
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
                  Total: <span className="font-semibold text-gray-900">{filteredAndSortedUsers.length}</span> usuarios
                </div>
                <button
                  onClick={refreshUsers}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {loading ? '🔄' : '🔄'} Actualizar
                </button>
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
          
          {/* Estadísticas de usuarios en tiempo real */}
          <div className="mb-6">
            <UserStats users={users} filteredCount={filteredAndSortedUsers.length} />
          </div>
          
          {/* Filtros y búsqueda */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar usuarios
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, email o rol..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
          
          {/* Lista de usuarios */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Lista de Usuarios Registrados</h2>
            </div>
            
            {filteredAndSortedUsers.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">
                  {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No se encontraron usuarios'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Usuario
                          {sortBy === 'name' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center">
                          Email
                          {sortBy === 'email' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center">
                          Fecha de Registro
                          {sortBy === 'created_at' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('role')}
                      >
                        <div className="flex items-center">
                          Rol
                          {sortBy === 'role' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedUsers.map((user) => {
                      const userLoading = loadingStates[user.id]
                      const userName = user.user_metadata?.full_name || user.email || 'Usuario'
                      return (
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
                                disabled={userLoading?.roleUpdate}
                                className={`block w-full pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  userLoading?.roleUpdate ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                <option value="user">Usuario</option>
                                <option value="admin">Administrador</option>
                              </select>
                              {userLoading?.roleUpdate && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              )}
                              <button
                                onClick={() => showDeleteConfirmation(user.id, userName)}
                                disabled={userLoading?.delete}
                                className={`bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                  userLoading?.delete ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                title="Eliminar usuario"
                              >
                                {userLoading?.delete ? '⏳' : '🗑️'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  Mostrando <span className="font-medium">{filteredAndSortedUsers.length}</span> de <span className="font-medium">{users.length}</span> usuarios
                  {searchTerm && (
                    <span className="ml-2 text-blue-600">(filtrados)</span>
                  )}
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