'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useAuth } from '@/lib/auth-context'

interface MemorialFavoriteButtonProps {
  memorialId: string
}

export default function MemorialFavoriteButton({ memorialId }: MemorialFavoriteButtonProps) {
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Debug: Log del estado del componente
  useEffect(() => {
    console.log('🔍 MemorialFavoriteButton Debug:', {
      memorialId,
      userId: user?.id,
      isAuthenticated: !!user,
      isFavorite,
      loading,
      error,
      initialized
    })
  }, [memorialId, user, isFavorite, loading, error, initialized])

  const checkFavoriteStatus = useCallback(async () => {
    if (!user?.id) {
      console.log('❌ No hay usuario autenticado para verificar favoritos')
      setInitialized(true)
      return
    }

    console.log('🔍 Verificando estado de favorito para:', { userId: user.id, memorialId })

    try {
      const { data, error } = await supabase
        .from('memorial_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('memorial_id', memorialId)
        .maybeSingle()

      if (error) {
        console.error('❌ Error al verificar estado de favorito:', error)
        setError(`Error al verificar: ${error.message}`)
        setInitialized(true)
        return
      }
      
      const newIsFavorite = !!data
      console.log('✅ Estado de favorito verificado:', { isFavorite: newIsFavorite, data })
      setIsFavorite(newIsFavorite)
      setError(null)
      setInitialized(true)
    } catch (err) {
      console.error('❌ Error al verificar estado de favorito:', err)
      setError(`Error inesperado: ${err}`)
      setInitialized(true)
    }
  }, [user?.id, memorialId])

  useEffect(() => {
    if (user?.id) {
      console.log('🔄 Usuario autenticado, verificando favoritos...')
      checkFavoriteStatus()
    } else {
      console.log('ℹ️ Usuario no autenticado, limpiando estado de favoritos')
      setIsFavorite(false)
      setError(null)
      setInitialized(true)
    }
  }, [user, memorialId, checkFavoriteStatus])

  const toggleFavorite = async () => {
    if (!user?.id) {
      console.log('❌ Usuario no autenticado, no se puede actualizar favoritos')
      setError('Debes iniciar sesión para usar favoritos')
      return
    }
    
    console.log('🔄 Cambiando estado de favorito:', { 
      currentState: isFavorite, 
      userId: user.id, 
      memorialId 
    })
    
    setLoading(true)
    setError(null)

    try {
      if (isFavorite) {
        // Eliminar de favoritos
        console.log('🗑️ Eliminando de favoritos...')
        const { error } = await supabase
          .from('memorial_favorites')
          .delete()
          .match({
            user_id: user.id,
            memorial_id: memorialId
          })

        if (error) {
          console.error('❌ Error al eliminar de favoritos:', error)
          setError(`Error al eliminar: ${error.message}`)
          return
        }
        
        console.log('✅ Eliminado de favoritos exitosamente')
        setIsFavorite(false)
      } else {
        // Agregar a favoritos
        console.log('❤️ Agregando a favoritos...')
        const { error } = await supabase
          .from('memorial_favorites')
          .insert({
            user_id: user.id,
            memorial_id: memorialId
          })

        if (error) {
          console.error('❌ Error al agregar a favoritos:', error)
          setError(`Error al agregar: ${error.message}`)
          
          // Si es un error de política RLS, mostrar instrucciones específicas
          if (error.message.includes('row-level security policy')) {
            setError(`Error de permisos: ${error.message}. Verifica las políticas RLS para administradores.`)
          }
          return
        }
        
        console.log('✅ Agregado a favoritos exitosamente')
        setIsFavorite(true)
      }

      console.log('✅ Estado actualizado:', !isFavorite)
    } catch (err) {
      console.error('❌ Error al actualizar favorito:', err)
      setError(`Error inesperado: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  // Debug: Renderizado del componente
  console.log('🎨 Renderizando MemorialFavoriteButton:', {
    memorialId,
    isAuthenticated: !!user,
    isFavorite,
    loading,
    error,
    initialized
  })

  if (!user) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg border border-gray-200">
        <HeartIcon className="h-5 w-5" />
        <span>Inicia sesión para agregar a favoritos</span>
      </div>
    )
  }

  // Mostrar loading mientras se inicializa
  if (!initialized) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg border border-gray-200">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
        <span>Verificando favoritos...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-2">
      <button
        onClick={toggleFavorite}
        disabled={loading}
        className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 border border-gray-200"
      >
        {isFavorite ? (
          <HeartIconSolid className="h-5 w-5 text-red-500" />
        ) : (
          <HeartIcon className="h-5 w-5" />
        )}
        <span>{isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}</span>
        {loading && <span className="text-sm text-gray-500">...</span>}
      </button>
      
      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
          <div className="font-medium">Error:</div>
          <div>{error}</div>
          {error.includes('políticas RLS') && (
            <div className="mt-1 text-xs">
              <strong>Solución:</strong> Ve a Supabase Dashboard &gt; Authentication &gt; Policies &gt; memorial_favorites
              y agrega la política &quot;Admins can insert any favorites&quot;
            </div>
          )}
        </div>
      )}
      
      {/* Debug info - solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
          <div>Debug: ID={memorialId}</div>
          <div>User={user?.id?.slice(0, 8)}...</div>
          <div>State={isFavorite ? '❤️ Favorito' : '🤍 No favorito'}</div>
          <div>Loading={loading ? '⏳' : '✅'}</div>
        </div>
      )}
    </div>
  )
} 