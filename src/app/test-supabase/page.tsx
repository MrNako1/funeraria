'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/supabase'

export default function TestSupabase() {
  const [plantillas, setPlantillas] = useState<Tables<'plantillas'>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlantillas() {
      try {
        const { data, error } = await supabase
          .from('plantillas')
          .select('*')
          .limit(5)

        if (error) throw error

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setPlantillas((data as any) || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchPlantillas()
  }, [])

  if (loading) return <div className="p-4">Cargando...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Prueba de Conexión Supabase</h1>
      <div className="bg-green-100 p-4 rounded mb-4">
        ✅ Conexión exitosa con Supabase
      </div>
      
      <h2 className="text-xl font-semibold mb-2">Plantillas encontradas:</h2>
      {plantillas.length === 0 ? (
        <p>No hay plantillas en la base de datos</p>
      ) : (
        <ul className="space-y-2">
          {plantillas.map((plantilla) => (
            <li key={plantilla.id} className="border p-2 rounded">
              <p><strong>Nombre:</strong> {plantilla.primer_nombre} {plantilla.segundo_nombre} {plantilla.apellido_paterno} {plantilla.apellido_materno}</p>
              <p><strong>Fecha de nacimiento:</strong> {plantilla.fecha_nacimiento}</p>
              <p><strong>Fecha de fallecimiento:</strong> {plantilla.fecha_fallecimiento}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 