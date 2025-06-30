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
  const [initialized, setInitialized] = useState(false)

  const checkFavoriteStatus = useCallback(async () => {
    if (!user?.id) {
      setInitialized(true)
      return
    }

    try {
      const { data, error } = await supabase
        .from('memorial_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('memorial_id', memorialId)
        .maybeSingle()

      if (error) {
        console.error('Error al verificar estado de favorito:', error)
        setInitialized(true)
        return
      }
      
      const newIsFavorite = !!data
      setIsFavorite(newIsFavorite)
      setInitialized(true)
    } catch (err) {
      console.error('Error al verificar estado de favorito:', err)
      setInitialized(true)
    }
  }, [user?.id, memorialId])

  useEffect(() => {
    if (user?.id) {
      checkFavoriteStatus()
    } else {
      setIsFavorite(false)
      setInitialized(true)
    }
  }, [user, memorialId, checkFavoriteStatus])

  const toggleFavorite = async () => {
    if (!user?.id) {
      alert('Debes iniciar sesión para usar favoritos')
      return
    }
    
    setLoading(true)

    try {
      if (isFavorite) {
        // Eliminar de favoritos
        const { error } = await supabase
          .from('memorial_favorites')
          .delete()
          .match({
            user_id: user.id,
            memorial_id: memorialId
          })

        if (error) {
          console.error('Error al eliminar de favoritos:', error)
          alert(`Error al eliminar de favoritos: ${error.message}`)
          return
        }
        
        setIsFavorite(false)
      } else {
        // Agregar a favoritos
        const { error } = await supabase
          .from('memorial_favorites')
          .insert({
            user_id: user.id,
            memorial_id: memorialId
          })

        if (error) {
          console.error('Error al agregar a favoritos:', error)
          
          // Si es un error de política RLS, mostrar instrucciones específicas
          if (error.message.includes('row-level security policy')) {
            alert(`Error de permisos: ${error.message}. Verifica las políticas RLS para administradores.`)
          } else {
            alert(`Error al agregar a favoritos: ${error.message}`)
          }
          return
        }
        
        setIsFavorite(true)
      }
    } catch (err) {
      console.error('Error al actualizar favorito:', err)
      alert(`Error inesperado: ${err}`)
    } finally {
      setLoading(false)
    }
  }

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
  )
} 