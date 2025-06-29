import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type UserRole = 'user' | 'admin' | 'cliente'

export function useRole() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setRole(null)
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .eq('user_id', user.id as any)
          .maybeSingle()

        if (error) {
          console.error('Error fetching role:', error)
          setRole('user') // Default role
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setRole(((data as any)?.role as UserRole) || 'user')
        }
      } catch (error) {
        console.error('Error in useRole:', error)
        setRole('user') // Default role
      } finally {
        setLoading(false)
      }
    }

    fetchRole()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .eq('user_id', session.user.id as any)
          .maybeSingle()

        if (error) {
          console.error('Error fetching role on auth change:', error)
          setRole('user')
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setRole(((data as any)?.role as UserRole) || 'user')
        }
      } else if (event === 'SIGNED_OUT') {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { role, loading }
} 