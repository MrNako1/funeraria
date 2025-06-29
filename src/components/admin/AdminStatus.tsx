'use client'

import { useAuth } from '@/lib/auth-context'

export default function AdminStatus() {
  const { user, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-md text-sm">
        Cargando estado de usuario...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="fixed bottom-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm">
        No hay usuario autenticado
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded-md text-sm">
      <div>Usuario: {user.email}</div>
      <div>Rol: {userRole || 'No asignado'}</div>
      <div>Es Admin: {userRole === 'admin' ? 'Sí' : 'No'}</div>
    </div>
  )
} 