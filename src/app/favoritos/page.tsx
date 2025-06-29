'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Image from 'next/image'
import Link from 'next/link'
import { PhotoIcon } from '@heroicons/react/24/outline'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface Memorial {
  id: string
  primer_nombre: string
  segundo_nombre: string | null
  apellido_paterno: string
  apellido_materno: string | null
  fecha_nacimiento: string
  fecha_fallecimiento: string
  foto: string | null
}

export default function FavoritosPage() {
  const { user } = useAuth()
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('memorial_favorites')
          .select(`
            plantilla:memorial_id (
              id,
              primer_nombre,
              segundo_nombre,
              apellido_paterno,
              apellido_materno,
              fecha_nacimiento,
              fecha_fallecimiento,
              foto
            )
          `)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .eq('user_id', user.id as any)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error de Supabase:', error)
          throw error
        }
        
        // Verificar que data existe y no es un error
        if (!data || Array.isArray(data) === false) {
          throw new Error('Datos inválidos recibidos de Supabase')
        }
        
        // Filtrar los memoriales que existen y mapear correctamente
        const validMemorials = (data as unknown as Array<{ plantilla: Memorial | null }>)
          .map(item => item.plantilla)
          .filter((memorial): memorial is Memorial => memorial !== null)
        
        setMemorials(validMemorials)
      } catch (err) {
        console.error('Error al cargar favoritos:', err)
        setError('Error al cargar los memoriales favoritos')
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [user])

  const getFullName = (memorial: Memorial) => {
    const names = [
      memorial.primer_nombre,
      memorial.segundo_nombre,
      memorial.apellido_paterno,
      memorial.apellido_materno
    ].filter(Boolean)
    return names.join(' ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mis Memoriales Favoritos</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : memorials.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="text-lg">No tienes memoriales favoritos</p>
            <p className="mt-2">Visita los memoriales y agrégalos a tus favoritos para verlos aquí</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memorials.map((memorial) => (
              <Link
                key={memorial.id}
                href={`/memorial/${memorial.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 rounded-t-lg overflow-hidden">
                  {memorial.foto ? (
                    <Image
                      src={memorial.foto}
                      alt={getFullName(memorial)}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full bg-gray-100 flex items-center justify-center">
                      <PhotoIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{getFullName(memorial)}</h2>
                  <p className="text-gray-600">
                    {formatDate(memorial.fecha_nacimiento)} - {formatDate(memorial.fecha_fallecimiento)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
} 