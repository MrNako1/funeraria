'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Image from 'next/image'
import Link from 'next/link'
import { HeartIcon, PhotoIcon } from '@heroicons/react/24/outline'
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

export default function SeresQueridosPage() {
  const { user } = useAuth()
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMemorials = async () => {
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
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        // Filtrar los memoriales que existen y mapear correctamente
        const validMemorials = data
          .map(item => item.plantilla)
          .filter((memorial): memorial is Memorial => memorial !== null)
        
        setMemorials(validMemorials)
      } catch (err) {
        console.error('Error al cargar memoriales:', err)
        setError('Error al cargar los memoriales')
      } finally {
        setLoading(false)
      }
    }

    fetchMemorials()
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Mis Seres Queridos
            </h1>
            <p className="text-lg text-gray-600">
              Memoriales que has marcado como favoritos para recordar y honrar
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {memorials.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No tienes seres queridos agregados</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Visita los memoriales y agrégalos a tus favoritos para verlos aquí
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/buscar"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Buscar Memoriales
                    </Link>
                  </div>
                </div>
              ) : (
                memorials.map((memorial) => (
                  <Link
                    key={memorial.id}
                    href={`/memorial/${memorial.id}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      {memorial.foto ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={memorial.foto}
                            alt={getFullName(memorial)}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <PhotoIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {getFullName(memorial)}
                      </h3>
                      <p className="text-gray-600">
                        {formatDate(memorial.fecha_nacimiento)} - {formatDate(memorial.fecha_fallecimiento)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
} 