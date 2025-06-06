'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function PlantillasPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mis Plantillas</h1>
        {/* Aquí irá el contenido de las plantillas */}
      </div>
    </ProtectedRoute>
  )
} 