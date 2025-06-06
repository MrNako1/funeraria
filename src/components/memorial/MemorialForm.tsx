'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { PhotoIcon } from '@heroicons/react/24/outline'

export default function MemorialForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    primer_nombre: '',
    segundo_nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    fecha_fallecimiento: '',
    biografia: '',
    comentarios: '',
    logros: '',
    foto: null as File | null,
    fotoUrl: '' as string | null
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        foto: file,
        fotoUrl: URL.createObjectURL(file)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      let fotoUrl = null

      // Validar campos requeridos
      if (!formData.primer_nombre || !formData.apellido_paterno || !formData.fecha_nacimiento || !formData.fecha_fallecimiento || !formData.biografia) {
        throw new Error('Por favor completa todos los campos requeridos')
      }

      // Subir la imagen si existe
      if (formData.foto) {
        try {
          const fileExt = formData.foto.name.split('.').pop()
          const fileName = `${Math.random()}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('memoriales')
            .upload(fileName, formData.foto)

          if (uploadError) {
            console.error('Error al subir la imagen:', uploadError)
            throw new Error('Error al subir la imagen')
          }

          const { data: { publicUrl } } = supabase.storage
            .from('memoriales')
            .getPublicUrl(fileName)

          fotoUrl = publicUrl
        } catch (uploadErr) {
          console.error('Error en el proceso de subida:', uploadErr)
          throw new Error('Error al procesar la imagen')
        }
      }

      // Crear el memorial
      const { error: insertError } = await supabase
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
          foto: fotoUrl
        })

      if (insertError) {
        console.error('Error al crear el memorial:', insertError)
        throw new Error('Error al crear el memorial')
      }

      setSuccess(true)
      setFormData({
        primer_nombre: '',
        segundo_nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        fecha_nacimiento: '',
        fecha_fallecimiento: '',
        biografia: '',
        comentarios: '',
        logros: '',
        foto: null,
        fotoUrl: null
      })

      // Limpiar el input de archivo
      const fileInput = document.getElementById('foto') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }

    } catch (err) {
      console.error('Error completo:', err)
      setError(err instanceof Error ? err.message : 'Error al crear el memorial')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-8 space-y-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Crear Memorial</h2>
          <p className="text-lg text-gray-600">Honra la memoria de tu ser querido</p>
        </div>

        {error && (
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
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Memorial creado exitosamente</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                {formData.fotoUrl ? (
                  <img
                    src={formData.fotoUrl}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <PhotoIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              <label
                htmlFor="foto"
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
              <input
                type="file"
                id="foto"
                name="foto"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="mt-4 text-sm text-gray-500">Haz clic en el ícono para subir una foto</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="primer_nombre" className="block text-sm font-medium text-gray-700">
                  Primer Nombre *
                </label>
                <input
                  type="text"
                  id="primer_nombre"
                  name="primer_nombre"
                  required
                  value={formData.primer_nombre}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="segundo_nombre" className="block text-sm font-medium text-gray-700">
                  Segundo Nombre
                </label>
                <input
                  type="text"
                  id="segundo_nombre"
                  name="segundo_nombre"
                  value={formData.segundo_nombre}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="apellido_paterno" className="block text-sm font-medium text-gray-700">
                  Apellido Paterno *
                </label>
                <input
                  type="text"
                  id="apellido_paterno"
                  name="apellido_paterno"
                  required
                  value={formData.apellido_paterno}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="apellido_materno" className="block text-sm font-medium text-gray-700">
                  Apellido Materno
                </label>
                <input
                  type="text"
                  id="apellido_materno"
                  name="apellido_materno"
                  value={formData.apellido_materno}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  required
                  value={formData.fecha_nacimiento}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="fecha_fallecimiento" className="block text-sm font-medium text-gray-700">
                  Fecha de Fallecimiento *
                </label>
                <input
                  type="date"
                  id="fecha_fallecimiento"
                  name="fecha_fallecimiento"
                  required
                  value={formData.fecha_fallecimiento}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <label htmlFor="biografia" className="block text-sm font-medium text-gray-700">
                Biografía *
              </label>
              <textarea
                id="biografia"
                name="biografia"
                required
                rows={6}
                maxLength={2000}
                value={formData.biografia}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Escribe la biografía del ser querido..."
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.biografia.length}/2000 caracteres
              </p>
            </div>

            <div>
              <label htmlFor="logros" className="block text-sm font-medium text-gray-700">
                Logros y Reconocimientos
              </label>
              <textarea
                id="logros"
                name="logros"
                rows={4}
                value={formData.logros}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Logros y reconocimientos importantes..."
              />
            </div>

            <div>
              <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700">
                Comentarios Adicionales
              </label>
              <textarea
                id="comentarios"
                name="comentarios"
                rows={4}
                value={formData.comentarios}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Comentarios adicionales..."
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                'Crear Memorial'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
} 