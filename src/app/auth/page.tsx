'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
  created_at: string
  role: 'user' | 'admin' | 'cliente'
}

interface UserRoleData {
  user_id: string
  role: 'user' | 'admin' | 'cliente'
  created_at?: string
}

interface SupabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  
  // Estados para la lista de usuarios
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  
  // Estados para edición de roles
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [newRole, setNewRole] = useState<'user' | 'admin' | 'cliente'>('user')
  const [updatingRole, setUpdatingRole] = useState(false)
  
  const { user, signIn, signUp, userRole } = useAuth()
  const router = useRouter()

  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true)
      setMessage('')
      setMessageType('')
      
      console.log('🔄 Cargando usuarios...')
      console.log('Usuario actual:', user?.email)
      console.log('Rol actual:', userRole)
      console.log('ID del usuario:', user?.id)
      
      // Verificar si tenemos acceso a Supabase
      console.log('🔍 Verificando conexión a Supabase...')
      
      let usersArray: User[] = []
      
      // Intentar diferentes métodos en orden de preferencia (priorizar emails reales)
      const methods = [
        { name: 'get_all_users_with_emails', fn: () => supabase.rpc('get_all_users_with_emails') },
        { name: 'get_users_via_view', fn: () => supabase.rpc('get_users_via_view') },
        { name: 'get_users_with_emails', fn: () => supabase.rpc('get_users_with_emails') },
        { name: 'get_users_with_roles', fn: () => supabase.rpc('get_users_with_roles') },
        { name: 'get_users_simple', fn: () => supabase.rpc('get_users_simple') }
      ]
      
      for (const method of methods) {
        try {
          console.log(`🔄 Intentando método: ${method.name}...`)
          const { data, error } = await method.fn()
          
          if (error) {
            console.log(`❌ Método ${method.name} falló:`, error)
            continue
          }
          
          console.log(`✅ Método ${method.name} exitoso:`, data)
          if (data && Array.isArray(data) && data.length > 0) {
            usersArray = (data as User[]) || []
            console.log(`📧 Emails obtenidos:`, usersArray.map(u => u.email))
            break
          } else {
            console.log(`⚠️ Método ${method.name} no devolvió datos`)
          }
          
        } catch (methodError) {
          console.log(`❌ Error en método ${method.name}:`, methodError)
          continue
        }
      }
      
      // Si ningún método funcionó, usar método de respaldo
      if (usersArray.length === 0) {
        console.log('🔄 Usando método de respaldo...')
        
        try {
          const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('*')
          
          if (rolesError) {
            console.error('❌ Error obteniendo roles:', rolesError)
            throw rolesError
          }
          
          console.log('✅ Roles obtenidos:', rolesData)
          
          if (rolesData && rolesData.length > 0) {
            usersArray = (rolesData as unknown as UserRoleData[]).map((role) => ({
              id: role.user_id,
              email: `Usuario ${role.user_id.slice(0, 8)}...`,
              created_at: role.created_at || new Date().toISOString(),
              role: role.role
            }))
          }
        } catch (backupError) {
          console.error('❌ Error en método de respaldo:', backupError)
          throw backupError
        }
      }
      
      console.log('✅ Usuarios procesados:', usersArray)
      console.log('📊 Total de usuarios:', usersArray.length)
      console.log('📧 Emails encontrados:', usersArray.map(u => u.email))
      
      setUsers(usersArray)
      setMessage(`Cargados ${usersArray.length} usuarios exitosamente`)
      setMessageType('success')
      
    } catch (error: unknown) {
      console.error('❌ Error cargando usuarios:', error)
      const supabaseError = error as SupabaseError
      console.error('Detalles del error:', {
        message: supabaseError.message,
        code: supabaseError.code,
        details: supabaseError.details,
        hint: supabaseError.hint
      })
      
      setMessage(`Error cargando usuarios: ${supabaseError.message || 'Error desconocido'}`)
      setMessageType('error')
      
      // Mostrar información de debug
      console.log('🔍 Información de debug:')
      console.log('- Usuario autenticado:', !!user)
      console.log('- Rol del usuario:', userRole)
      console.log('- ID del usuario:', user?.id)
      console.log('- Estado de loading:', loadingUsers)
    } finally {
      setLoadingUsers(false)
      console.log('🏁 Carga de usuarios completada')
    }
  }, [user, userRole, loadingUsers])

  // Cargar usuarios automáticamente cuando el usuario sea admin
  useEffect(() => {
    console.log('🔄 useEffect ejecutado')
    console.log('Usuario:', user?.email)
    console.log('Rol:', userRole)
    console.log('¿Es admin?', user && userRole === 'admin')
    console.log('Estado completo del usuario:', user)
    console.log('Estado completo del rol:', userRole)
    
    if (user && userRole === 'admin') {
      console.log('✅ Iniciando carga de usuarios...')
      loadUsers()
    } else {
      console.log('❌ No es admin o no está autenticado')
      console.log('Detalles:')
      console.log('- Usuario existe:', !!user)
      console.log('- Rol es admin:', userRole === 'admin')
      console.log('- Rol actual:', userRole)
      setUsers([])
    }
  }, [user, userRole, loadUsers])

  // Efecto adicional para debug
  useEffect(() => {
    console.log('🔍 DEBUG: Estado actualizado')
    console.log('- user:', user?.email)
    console.log('- userRole:', userRole)
    console.log('- users.length:', users.length)
    console.log('- loadingUsers:', loadingUsers)
  }, [user, userRole, users, loadingUsers])

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setNewRole(user.role)
    setShowEditModal(true)
  }

  const handleUpdateRole = async () => {
    if (!editingUser) return

    try {
      setUpdatingRole(true)
      setMessage('')
      setMessageType('')

      console.log(`🔄 Actualizando rol de ${editingUser.email} a ${newRole}`)

      // Actualizar el rol en la base de datos
      const updateData = {
        user_id: editingUser.id,
        role: newRole
      }
      
      const { error } = await supabase
        .from('user_roles')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(updateData as any, {
          onConflict: 'user_id'
        })

      if (error) {
        throw error
      }

      // Actualizar el estado local
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === editingUser.id 
            ? { ...u, role: newRole }
            : u
        )
      )

      setMessage(`Rol actualizado exitosamente: ${editingUser.email} → ${newRole}`)
      setMessageType('success')
      setShowEditModal(false)
      setEditingUser(null)

    } catch (error: unknown) {
      console.error('❌ Error actualizando rol:', error)
      const supabaseError = error as SupabaseError
      setMessage(`Error actualizando rol: ${supabaseError.message || 'Error desconocido'}`)
      setMessageType('error')
    } finally {
      setUpdatingRole(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      if (isLogin) {
        await signIn(email, password)
        setMessage('Login exitoso! Redirigiendo...')
        setMessageType('success')
        setTimeout(() => router.push('/'), 1000)
      } else {
        await signUp(email, password)
        setMessage('Registro exitoso! Revisa tu email para confirmar.')
        setMessageType('success')
      }
    } catch (error: unknown) {
      const supabaseError = error as SupabaseError
      setMessage(supabaseError.message || 'Error en la autenticación')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  // Si el usuario es admin y está autenticado, mostrar directamente la lista de usuarios
  if (user && userRole === 'admin') {
  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600">Gestión de usuarios del sistema</p>
              <p className="text-sm text-gray-500 mt-1">
                Conectado como: {user.email} (👑 Administrador)
              </p>
            </div>
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
                  <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">👤</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Usuarios Normales</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u.role === 'user').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">🛒</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Clientes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u.role === 'cliente').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">👑</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Administradores</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Usuarios */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Lista de Usuarios</h2>
              <button
                onClick={loadUsers}
                disabled={loadingUsers}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                🔄 Actualizar
              </button>
            </div>
            
            {loadingUsers ? (
              <div className="p-6 text-center">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cargando usuarios...
                </div>
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
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha de Creación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.email}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : user.role === 'cliente'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role === 'admin' ? '👑 Admin' : 
                             user.role === 'cliente' ? '🛒 Cliente' : 
                             '👤 Usuario'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
            >
                            ✏️ Editar
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            🗑️ Eliminar
            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Edición */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  ✏️ Editar Rol de Usuario
                </h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Usuario:</strong> {editingUser.email}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Rol actual:</strong> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      editingUser.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : editingUser.role === 'cliente'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {editingUser.role === 'admin' ? '👑 Admin' : 
                       editingUser.role === 'cliente' ? '🛒 Cliente' : 
                       '👤 Usuario'}
                    </span>
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nuevo Rol:
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'user' | 'admin' | 'cliente')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="user">👤 Usuario</option>
                    <option value="cliente">🛒 Cliente</option>
                    <option value="admin">👑 Administrador</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingUser(null)
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpdateRole}
                    disabled={updatingRole || newRole === editingUser.role}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingRole ? 'Actualizando...' : 'Actualizar Rol'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Vista normal de autenticación (solo para usuarios no admin)
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Formulario de autenticación */}
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isLogin ? 'Accede a tu cuenta' : 'Crea una nueva cuenta'}
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                  placeholder="tu@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm ${
                messageType === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-rose-600 hover:text-rose-500"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </form>
          </div>
      </div>
    </div>
  )
} 