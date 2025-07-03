'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRole } from '@/hooks/useRole'
import type { Tables } from '@/types/supabase'

type Plantilla = Tables<'plantillas'>

interface MemorialFormData {
  primer_nombre: string
  segundo_nombre: string
  apellido_paterno: string
  apellido_materno: string
  fecha_nacimiento: string
  fecha_fallecimiento: string
  biografia: string
  comentarios: string
  logros: string
  foto: string
}

function CrearMemorialContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const { role, loading: roleLoading } = useRole()
  
  const [formData, setFormData] = useState<MemorialFormData>({
    primer_nombre: '',
    segundo_nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    fecha_fallecimiento: '',
    biografia: '',
    comentarios: '',
    logros: '',
    foto: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Verificar permisos
  useEffect(() => {
    if (!roleLoading && (!role || (role !== 'admin' && role !== 'cliente'))) {
      router.push('/')
    }
  }, [role, roleLoading, router])

  // Cargar datos del memorial si estamos editando
  useEffect(() => {
    if (editId && typeof editId === 'string') {
      loadMemorialData(editId)
    }
  }, [editId])

  const loadMemorialData = async (id: string) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('plantillas')
        .select('*')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('id', id as any)
        .single()

      if (error) {
        console.error('Error al cargar memorial:', error)
        alert('Error al cargar el memorial')
        return
      }

      if (data) {
        // Usar type assertion con unknown para evitar errores de TypeScript
        const plantilla = data as unknown as Plantilla
        setFormData({
          primer_nombre: plantilla.primer_nombre || '',
          segundo_nombre: plantilla.segundo_nombre || '',
          apellido_paterno: plantilla.apellido_paterno || '',
          apellido_materno: plantilla.apellido_materno || '',
          fecha_nacimiento: plantilla.fecha_nacimiento || '',
          fecha_fallecimiento: plantilla.fecha_fallecimiento || '',
          biografia: plantilla.biografia || '',
          comentarios: plantilla.comentarios || '',
          logros: plantilla.logros || '',
          foto: plantilla.foto || ''
        })
        setIsEditing(true)
      }
    } catch (error) {
      console.error('Error inesperado:', error)
      alert('Error inesperado al cargar el memorial')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.primer_nombre || !formData.apellido_paterno) {
      alert('El primer nombre y apellido paterno son obligatorios')
      return
    }

    try {
      setIsLoading(true)

      if (isEditing && editId && typeof editId === 'string') {
        // Actualizar memorial existente
        const { error } = await supabase
          .from('plantillas')
          .update({
            primer_nombre: formData.primer_nombre,
            segundo_nombre: formData.segundo_nombre || null,
            apellido_paterno: formData.apellido_paterno,
            apellido_materno: formData.apellido_materno || null,
            fecha_nacimiento: formData.fecha_nacimiento,
            fecha_fallecimiento: formData.fecha_fallecimiento,
            biografia: formData.biografia,
            comentarios: formData.comentarios || null,
            logros: formData.logros || null,
            foto: formData.foto || null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .eq('id', editId as any)

        if (error) {
          console.error('Error al actualizar memorial:', error)
          alert('Error al actualizar el memorial')
          return
        }

        // Mostrar mensaje de éxito y redirigir
        alert('Memorial actualizado exitosamente')
        router.push(`/memorial/${editId}?updated=true`)
        router.refresh()
      } else {
        // Crear nuevo memorial
        const { data, error } = await supabase
          .from('plantillas')
          .insert({
            primer_nombre: formData.primer_nombre,
            segundo_nombre: formData.segundo_nombre || null,
            apellido_paterno: formData.apellido_paterno,
            apellido_materno: formData.apellido_materno || null,
            fecha_nacimiento: formData.fecha_nacimiento,
            fecha_fallecimiento: formData.fecha_fallecimiento,
            biografia: formData.biografia,
            comentarios: formData.comentarios || null,
            logros: formData.logros || null,
            foto: formData.foto || null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
          .select()
          .single()

        if (error) {
          console.error('Error al crear memorial:', error)
          alert('Error al crear el memorial')
          return
        }

        if (data) {
          // Usar type assertion con unknown para evitar errores de TypeScript
          const newMemorial = data as unknown as Plantilla
          alert('Memorial creado exitosamente')
          router.push(`/memorial/${newMemorial.id}`)
        }
      }
    } catch (error) {
      console.error('Error inesperado:', error)
      alert('Error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (!role || (role !== 'admin' && role !== 'cliente')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-light text-gray-900 mb-2">
              {isEditing ? 'Editar Memorial' : 'Crear Nuevo Memorial'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Modifica la información del memorial' : 'Completa la información para crear un nuevo memorial'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primer Nombre *
                </label>
                <input
                  type="text"
                  name="primer_nombre"
                  value={formData.primer_nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Segundo Nombre
                </label>
                <input
                  type="text"
                  name="segundo_nombre"
                  value={formData.segundo_nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido Paterno *
                </label>
                <input
                  type="text"
                  name="apellido_paterno"
                  value={formData.apellido_paterno}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido Materno
                </label>
                <input
                  type="text"
                  name="apellido_materno"
                  value={formData.apellido_materno}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fallecimiento
                </label>
                <input
                  type="date"
                  name="fecha_fallecimiento"
                  value={formData.fecha_fallecimiento}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Biografía */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografía
              </label>
              <textarea
                name="biografia"
                value={formData.biografia}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cuenta la historia de vida de la persona..."
              />
            </div>

            {/* Logros */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logros y Reconocimientos
              </label>
              <textarea
                name="logros"
                value={formData.logros}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Menciona los logros, premios, reconocimientos..."
              />
            </div>

            {/* Comentarios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Palabras de Familia
              </label>
              <textarea
                name="comentarios"
                value={formData.comentarios}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mensaje especial de la familia..."
              />
            </div>

            {/* Foto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de la Foto
              </label>
              <input
                type="url"
                name="foto"
                value={formData.foto}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://ejemplo.com/foto.jpg"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  isEditing ? 'Actualizar Memorial' : 'Crear Memorial'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Componente de fallback para Suspense
function CrearMemorialFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando formulario...</p>
      </div>
    </div>
  )
}

export default function CrearMemorialPage() {
  return (
    <Suspense fallback={<CrearMemorialFallback />}>
      <CrearMemorialContent />
    </Suspense>
  )
} 