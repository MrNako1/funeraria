'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRole } from '@/hooks/useRole'
import { Memorial } from '@/types/memorial'

interface EditMemorialModalProps {
  memorial: Memorial
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedMemorial: Memorial) => void
}

export default function EditMemorialModal({ memorial, isOpen, onClose, onUpdate }: EditMemorialModalProps) {
  const { role, loading: roleLoading } = useRole()
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
    foto: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  // Cargar datos del memorial cuando se abre el modal
  useEffect(() => {
    if (isOpen && memorial) {
      setFormData({
        primer_nombre: memorial.primer_nombre || '',
        segundo_nombre: memorial.segundo_nombre || '',
        apellido_paterno: memorial.apellido_paterno || '',
        apellido_materno: memorial.apellido_materno || '',
        fecha_nacimiento: memorial.fecha_nacimiento || '',
        fecha_fallecimiento: memorial.fecha_fallecimiento || '',
        biografia: memorial.biografia || '',
        comentarios: memorial.comentarios || '',
        logros: memorial.logros || '',
        foto: memorial.foto || ''
      })
    }
  }, [isOpen, memorial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.primer_nombre || !formData.apellido_paterno) {
      alert('El primer nombre y apellido paterno son obligatorios')
      return
    }

    try {
      setIsLoading(true)

      const { error } = await supabase
        .from('plantillas')
        .update({
          primer_nombre: formData.primer_nombre,
          segundo_nombre: formData.segundo_nombre,
          apellido_paterno: formData.apellido_paterno,
          apellido_materno: formData.apellido_materno,
          fecha_nacimiento: formData.fecha_nacimiento,
          fecha_fallecimiento: formData.fecha_fallecimiento,
          biografia: formData.biografia,
          comentarios: formData.comentarios,
          logros: formData.logros,
          foto: formData.foto
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('id', memorial.id as any)

      if (error) {
        console.error('Error al actualizar memorial:', error)
        alert('Error al actualizar el memorial')
        return
      }

      // Crear objeto actualizado para pasar al callback
      const updatedMemorial = {
        ...memorial,
        ...formData
      }

      alert('Memorial actualizado exitosamente')
      onUpdate(updatedMemorial)
      onClose()
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

  // Verificaciones condicionales después de todos los hooks
  if (!isOpen) return null
  
  // Solo mostrar para cliente y admin
  if (roleLoading || !role || (role !== 'cliente' && role !== 'admin')) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light text-gray-900">
              Editar Memorial
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                rows={4}
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
                rows={3}
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
                onClick={onClose}
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
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Memorial'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 