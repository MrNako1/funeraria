import { supabase } from '@/lib/supabase'
import MemorialClient from './MemorialClient'


export default async function MemorialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: memorial, error } = await supabase
    .from('plantillas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error('Error al cargar el memorial')
  }

  if (!memorial) {
    throw new Error('Memorial no encontrado')
  }

  return <MemorialClient memorial={memorial} />
} 