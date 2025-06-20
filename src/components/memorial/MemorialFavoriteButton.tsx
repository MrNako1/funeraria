'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    if (user?.id) {
      checkFavoriteStatus()
    }
  }, [user, memorialId])

  const checkFavoriteStatus = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('memorial_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('memorial_id', memorialId)
        .maybeSingle()

      if (error) throw error
      setIsFavorite(!!data)
    } catch (err) {
      console.error('Error al verificar estado de favorito:', err)
    }
  }

  const toggleFavorite = async () => {
    if (!user?.id) return
    setLoading(true)

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('memorial_favorites')
          .delete()
          .match({
            user_id: user.id,
            memorial_id: memorialId
          })

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('memorial_favorites')
          .insert({
            user_id: user.id,
            memorial_id: memorialId
          })

        if (error) throw error
      }

      setIsFavorite(!isFavorite)
    } catch (err) {
      console.error('Error al actualizar favorito:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

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
    </button>
  )
} 