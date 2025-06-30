'use client'

import { useState } from 'react'
import { useRole } from '@/hooks/useRole'
import EditMemorialModal from './EditMemorialModal'
import { Memorial } from '@/types/memorial'

interface EditMemorialButtonProps {
  memorial: Memorial
  onUpdate?: (updatedMemorial: Memorial) => void
}

export default function EditMemorialButton({ memorial, onUpdate }: EditMemorialButtonProps) {
  const { role, loading } = useRole()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleEdit = () => {
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
  }

  const handleUpdate = (updatedMemorial: Memorial) => {
    if (onUpdate) {
      onUpdate(updatedMemorial)
    }
    // También recargar la página para asegurar que los cambios se reflejen
    window.location.reload()
  }

  // Solo mostrar para cliente y admin - después de todos los hooks
  if (loading || !role || (role !== 'cliente' && role !== 'admin')) {
    return null
  }

  return (
    <>
      <button
        onClick={handleEdit}
        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Editar Memorial
      </button>

      <EditMemorialModal
        memorial={memorial}
        isOpen={isModalOpen}
        onClose={handleClose}
        onUpdate={handleUpdate}
      />
    </>
  )
} 