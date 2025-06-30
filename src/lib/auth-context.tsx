'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabase } from './supabase'

// Actualizar el tipo de rol para incluir 'cliente'
type UserRole = 'user' | 'admin' | 'cliente'

interface UserWithRole extends User {
  role?: UserRole
}

type AuthContextType = {
  user: UserWithRole | null
  loading: boolean
  userRole: UserRole | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<void>
  clearSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      console.log('🔍 Buscando rol para usuario:', userId)
      
      // Intentar obtener el rol del usuario usando una consulta más simple
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .filter('user_id', 'eq', userId)
        .maybeSingle()

      console.log('📊 Resultado de fetchUserRole:', { data, error })

      // Si hay un error o no hay datos, usar rol por defecto
      if (error || !data) {
        console.log('⚠️ No se encontró rol, creando rol por defecto...')
        
        // Intentar crear un rol por defecto solo si no hay error de permisos
        if (!error || (error.code !== 'PGRST116' && error.code !== '500')) {
          try {
            // Usar una función RPC para insertar el rol por defecto
            const { error: insertError } = await supabase
              .rpc('update_user_role', {
                target_user_id: userId,
                new_role: 'user'
              })
            
            if (insertError) {
              console.log('❌ Error creando rol por defecto:', insertError)
            } else {
              console.log('✅ Rol por defecto creado exitosamente')
            }
          } catch (insertError) {
            console.log('❌ Error en inserción de rol por defecto:', insertError)
          }
        }
        return 'user'
      }

      // Verificar que data tenga la propiedad role y sea del tipo correcto
      if (data && typeof data === 'object' && 'role' in data) {
        console.log('✅ Rol encontrado:', data.role)
        return (data.role as UserRole) || 'user'
      }

      console.log('⚠️ Data no tiene la estructura esperada, usando rol por defecto')
      return 'user'
    } catch (error) {
      console.error('❌ Error in fetchUserRole:', error)
      return 'user'
    }
  }

  const updateUserWithRole = useCallback(async (user: User | null) => {
    try {
      console.log('🔄 updateUserWithRole llamado con:', user?.email)
      
      if (user) {
        console.log('👤 Usuario encontrado, obteniendo rol...')
        const role = await fetchUserRole(user.id)
        console.log('🎭 Rol obtenido:', role)
        
        const userWithRole = { ...user, role }
        console.log('✅ Usuario con rol configurado:', userWithRole.email, 'Rol:', role)
        
        setUser(userWithRole)
        setUserRole(role)
      } else {
        console.log('📭 No hay usuario, limpiando estado...')
        setUser(null)
        setUserRole(null)
      }
    } catch (error) {
      console.error('❌ Error updating user with role:', error)
      // En caso de error, establecer el usuario sin rol
      if (user) {
        console.log('🔄 Estableciendo usuario con rol por defecto debido a error')
        setUser({ ...user, role: 'user' })
        setUserRole('user')
      } else {
        setUser(null)
        setUserRole(null)
      }
    }
  }, [])

  const clearSession = async () => {
    try {
      console.log('🧹 Limpiando sesión completamente...')
      
      // Limpiar estado local
      setUser(null)
      setUserRole(null)
      
      // Limpiar localStorage y sessionStorage
      localStorage.clear()
      sessionStorage.clear()
      
      // Limpiar todas las cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      })
      
      // Llamar a Supabase signOut
      await supabase.auth.signOut()
      
      console.log('✅ Sesión limpiada completamente')
    } catch (error) {
      console.error('❌ Error limpiando sesión:', error)
    }
  }

  useEffect(() => {
    // Verificar si hay una sesión persistente
    const checkForSession = async () => {
      try {
        console.log('🔍 Verificando sesión existente...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error obteniendo sesión:', error)
          setLoading(false)
          return
        }

        // Si hay una sesión, configurar el usuario
        if (session?.user) {
          console.log('✅ Sesión encontrada:', session.user.email)
          await updateUserWithRole(session.user)
        } else {
          console.log('📭 No hay sesión activa')
          setUser(null)
          setUserRole(null)
        }
      } catch (error) {
        console.error('❌ Error verificando sesión:', error)
        setUser(null)
        setUserRole(null)
      } finally {
        setLoading(false)
      }
    }

    checkForSession()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Cambio de estado de autenticación:', event)
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ Usuario inició sesión:', session.user.email)
        await updateUserWithRole(session.user)
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 Usuario cerró sesión')
        setUser(null)
        setUserRole(null)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('🔄 Token renovado para:', session.user.email)
        await updateUserWithRole(session.user)
      } else if (session?.user) {
        console.log('🔄 Otro cambio de estado con usuario:', session.user.email)
        await updateUserWithRole(session.user)
      } else {
        console.log('🔄 Otro cambio de estado sin usuario')
        setUser(null)
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [updateUserWithRole])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Iniciando login para:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      
      console.log('✅ Login exitoso:', data.user?.email)
      
      // Verificar que la sesión se estableció correctamente
      if (data.session) {
        console.log('✅ Sesión establecida correctamente')
        await updateUserWithRole(data.user)
        
        // Redirigir al inicio después del login exitoso
        setTimeout(() => {
          router.push('/')
        }, 100)
      } else {
        console.error('❌ No se estableció la sesión después del login')
        throw new Error('Error al establecer la sesión')
      }
    } catch (error) {
      console.error('❌ Error en login:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      console.log('📝 Registrando usuario:', email)
      
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
      
      console.log('✅ Registro exitoso')
    } catch (error) {
      console.error('❌ Error en registro:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log('🔄 Iniciando signOut en AuthContext...');
      
      // Limpiar el estado local primero
      setUser(null);
      setUserRole(null);
      
      // Llamar a Supabase signOut
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Error en Supabase signOut:', error);
        throw error;
      }
      
      console.log('✅ Supabase signOut exitoso');
      
      // Limpiar cookies y localStorage
      try {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
        
        // Limpiar cookies de Supabase
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        console.log('✅ Estado local limpiado');
      } catch (cleanupError) {
        console.warn('⚠️ Error limpiando estado local:', cleanupError);
      }
      
    } catch (error) {
      console.error('❌ Error en signOut:', error);
      throw error;
    }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    if (error) throw error
  }

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    if (!user) throw new Error('Usuario no autenticado')
    
    const { error } = await supabase.auth.updateUser({
      data: updates
    })
    if (error) throw error

    // Actualizar el estado local
    if (user) {
      setUser({ ...user, user_metadata: { ...user.user_metadata, ...updates } })
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      userRole,
      signIn, 
      signUp, 
      signOut, 
      resetPassword, 
      updateProfile,
      clearSession
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
} 