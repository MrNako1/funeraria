'use client'

import Image from 'next/image'
import MemorialQR from '@/components/memorial/MemorialQR'
import MemorialGallery from '@/components/memorial/MemorialGallery'
import MemorialComments from '@/components/memorial/MemorialComments'
import MemorialFavoriteButton from '@/components/memorial/MemorialFavoriteButton'

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

export default function MemorialClient({ memorial }: { memorial: Memorial }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Información del memorial */}
            <div className="flex-1">
              <div className="flex justify-center mb-8">
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                  {memorial.foto ? (
                    <Image
                      src={memorial.foto}
                      alt={`${memorial.primer_nombre} ${memorial.apellido_paterno}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-4xl text-gray-400">
                        {memorial.primer_nombre[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-start mb-8">
                <h1 className="text-3xl font-bold">
                  {memorial.primer_nombre} {memorial.segundo_nombre} {memorial.apellido_paterno} {memorial.apellido_materno}
                </h1>
                <MemorialFavoriteButton memorialId={memorial.id} />
              </div>

              <div className="text-center text-gray-600 mb-6">
                {new Date(memorial.fecha_nacimiento).toLocaleDateString()} - {new Date(memorial.fecha_fallecimiento).toLocaleDateString()}
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Biografía</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{memorial.biografia}</p>
                </div>

                {memorial.logros && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Logros y Reconocimientos</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{memorial.logros}</p>
                  </div>
                )}

                {memorial.comentarios && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Comentarios Adicionales</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{memorial.comentarios}</p>
                  </div>
                )}

                {/* Galería de fotos */}
                <div className="mt-8">
                  <MemorialGallery memorialId={memorial.id} />
                </div>

                {/* Sección de comentarios */}
                <MemorialComments memorialId={memorial.id} />
              </div>
            </div>

            {/* Código QR */}
            <div className="md:w-64 flex flex-col items-center">
              <MemorialQR memorialId={memorial.id} className="sticky top-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 