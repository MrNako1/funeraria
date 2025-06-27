'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabase } from './supabase'

type UserRole = 'user' | 'admin'

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      // Intentar obtener el rol del usuario
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()

      // Si hay un error o no hay datos, usar rol por defecto
      if (error || !data) {
        // Intentar crear un rol por defecto solo si no hay error de permisos
        if (!error || (error.code !== 'PGRST116' && error.code !== '500')) {
          try {
            await supabase
              .from('user_roles')
              .insert({
                user_id: userId,
                role: 'user'
              })
          } catch {
            // Ignorar errores de inserción
            console.log('No se pudo crear rol por defecto, continuando con rol user')
          }
        }
        return 'user'
      }

      return (data.role as UserRole) || 'user'
    } catch (error) {
      console.error('Error in fetchUserRole:', error)
      return 'user'
    }
  }

  const updateUserWithRole = async (user: User | null) => {
    try {
      if (user) {
        const role = await fetchUserRole(user.id)
        setUser({ ...user, role })
        setUserRole(role)
      } else {
        setUser(null)
        setUserRole(null)
      }
    } catch (error) {
      console.error('Error updating user with role:', error)
      // En caso de error, establecer el usuario sin rol
      if (user) {
        setUser({ ...user, role: 'user' })
        setUserRole('user')
      } else {
        setUser(null)
        setUserRole(null)
      }
    }
  }

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await updateUserWithRole(session.user)
      } else {
        setUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await updateUserWithRole(session.user)
      } else {
        setUser(null)
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    
    // Redirigir al inicio después del login exitoso
    // Usar setTimeout para asegurar que el estado se actualice primero
    setTimeout(() => {
      router.push('/')
    }, 100)
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
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
      updateProfile 
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