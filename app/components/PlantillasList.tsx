'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

type Plantilla = Database['public']['Tables']['plantillas']['Row']

export default function PlantillasList() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlantillas() {
      try {
        const { data, error } = await supabase
          .from('plantillas')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }

        if (data) {
          setPlantillas(data)
        }
      } catch (error) {
        console.error('Error fetching plantillas:', error)
        setError('Error al cargar las plantillas')
      } finally {
        setLoading(false)
      }
    }

    fetchPlantillas()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    )
  }

  if (plantillas.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900">No hay plantillas disponibles</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva plantilla.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {plantillas.map((plantilla) => (
        <div
          key={plantilla.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          {plantilla.foto && (
            <div className="relative h-48 w-full">
              <img
                src={plantilla.foto}
                alt={`${plantilla.primer_nombre} ${plantilla.apellido_paterno}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <h3 className="text-xl font-semibold text-gray-800">
              {plantilla.primer_nombre} {plantilla.segundo_nombre} {plantilla.apellido_paterno} {plantilla.apellido_materno}
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <p><span className="font-medium">Nacimiento:</span> {new Date(plantilla.fecha_nacimiento).toLocaleDateString()}</p>
              <p><span className="font-medium">Fallecimiento:</span> {new Date(plantilla.fecha_fallecimiento).toLocaleDateString()}</p>
            </div>
            <p className="mt-3 text-gray-700 line-clamp-3">{plantilla.biografia}</p>
            {plantilla.logros && (
              <div className="mt-3">
                <h4 className="font-medium text-gray-800">Logros:</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{plantilla.logros}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 