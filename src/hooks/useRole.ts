import { useAuth } from '@/lib/auth-context'

export function useRole() {
  const { userRole } = useAuth()

  const isAdmin = userRole === 'admin'
  const isUser = userRole === 'user'
  const isAuthenticated = userRole !== null

  return {
    isAdmin,
    isUser,
    isAuthenticated,
    role: userRole
  }
} 