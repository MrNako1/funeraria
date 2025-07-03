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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('user_id', user.id as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('memorial_id', memorialId as any)
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)

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
      <button
        disabled
        className="p-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white/60 hover:bg-white/30 transition-all duration-200 cursor-not-allowed"
        title="Inicia sesión para agregar a favoritos"
      >
        <HeartIcon className="h-6 w-6" />
      </button>
    )
  }

  // Mostrar loading mientras se inicializa
  if (!initialized) {
    return (
      <button
        disabled
        className="p-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white/60 transition-all duration-200 cursor-not-allowed"
        title="Verificando favoritos..."
      >
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      </button>
    )
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full border transition-all duration-200 hover:scale-110 ${
        isFavorite 
          ? 'bg-red-500 border-red-500 text-white shadow-lg hover:bg-red-600' 
          : 'bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      {isFavorite ? (
        <HeartIconSolid className="h-6 w-6" />
      ) : (
        <HeartIcon className="h-6 w-6" />
      )}
    </button>
  )
} 