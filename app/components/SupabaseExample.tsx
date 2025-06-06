'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

type Plantilla = Database['public']['Tables']['plantillas']['Row']

export default function SupabaseExample() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlantillas() {
      try {
        const { data, error } = await supabase
          .from('plantillas')
          .select('*')
        
        if (error) {
          throw error
        }

        if (data) {
          setPlantillas(data)
        }
      } catch (error) {
        console.error('Error fetching plantillas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlantillas()
  }, [])

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div>
      <h1>Plantillas</h1>
      <ul>
        {plantillas.map((plantilla) => (
          <li key={plantilla.id}>
            {plantilla.primer_nombre} {plantilla.apellido_paterno}
          </li>
        ))}
      </ul>
    </div>
  )
} 