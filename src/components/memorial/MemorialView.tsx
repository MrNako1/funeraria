'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import { CalendarIcon, PhotoIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface Memorial {
  id: string
  primer_nombre: string
  segundo_nombre: string | null
  apellido_paterno: string
  apellido_materno: string | null
  fecha_nacimiento: string
  fecha_fallecimiento: string
  biografia: string
  comentarios: string | null
  logros: string | null
  foto: string | null
}

export default function MemorialView() {
  const params = useParams()
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMemorial = async () => {
      try {
        const memorialId = params?.id as string
        if (!memorialId) {
          throw new Error('ID de memorial no válido')
        }

        const { data, error } = await supabase
          .from('plantillas')
          .select('*')
          .eq('id', memorialId)
          .single()

        if (error) throw error
        setMemorial(data)
      } catch (err) {
        console.error('Error al cargar el memorial:', err)
        setError('Error al cargar el memorial')
      } finally {
        setLoading(false)
      }
    }

    fetchMemorial()
  }, [params?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !memorial) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error || 'Memorial no encontrado'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getFullName = () => {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Cabecera con foto */}
          <div className="relative h-64 bg-gray-900">
            {memorial.foto ? (
              <div className="relative w-full h-full">
                <Image
                  src={memorial.foto}
                  alt={getFullName()}
                  fill
                  className="object-cover opacity-75"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <PhotoIcon className="h-24 w-24 text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h1 className="text-4xl font-bold text-white mb-2">{getFullName()}</h1>
              <div className="flex items-center text-gray-300">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span>
                  {formatDate(memorial.fecha_nacimiento)} - {formatDate(memorial.fecha_fallecimiento)}
                </span>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-8 space-y-8">
            {/* Biografía */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Biografía</h2>
              <div className="prose max-w-none">
                <p className="text-gray-600 whitespace-pre-line">{memorial.biografia}</p>
              </div>
            </div>

            {/* Logros */}
            {memorial.logros && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Logros y Reconocimientos</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-600 whitespace-pre-line">{memorial.logros}</p>
                </div>
              </div>
            )}

            {/* Comentarios */}
            {memorial.comentarios && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Comentarios Adicionales</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-600 whitespace-pre-line">{memorial.comentarios}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 