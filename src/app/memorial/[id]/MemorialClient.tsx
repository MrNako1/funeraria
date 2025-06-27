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
  const getFullName = () => {
    const names = [
      memorial.primer_nombre,
      memorial.segundo_nombre,
      memorial.apellido_paterno,
      memorial.apellido_materno
    ].filter(Boolean)
    return names.join(' ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Cabecera solemne */}
      <div className="relative h-96 bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;)`
          }} />
        </div>

        {/* Foto de fondo con overlay */}
        {memorial.foto && (
          <div className="absolute inset-0">
            <Image
              src={memorial.foto}
              alt={getFullName()}
              fill
              className="object-cover opacity-20"
            />
          </div>
        )}

        {/* Contenido de la cabecera */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4">
          <div className="mb-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl mb-6">
              {memorial.foto ? (
                <Image
                  src={memorial.foto}
                  alt={getFullName()}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/20 flex items-center justify-center">
                  <span className="text-4xl text-white/80 font-light">
                    {memorial.primer_nombre[0]}
                  </span>
                </div>
              )}
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-wide">
            {getFullName()}
          </h1>

          <div className="text-xl text-white/90 font-light mb-6">
            <span>{formatDate(memorial.fecha_nacimiento)}</span>
            <span className="mx-4">•</span>
            <span>{formatDate(memorial.fecha_fallecimiento)}</span>
          </div>

          <div className="text-lg text-white/80 font-light italic">
            &ldquo;En memoria de una vida bien vivida&rdquo;
          </div>
        </div>

        {/* Botón de favoritos en la esquina */}
        <div className="absolute top-6 right-6">
          <MemorialFavoriteButton memorialId={memorial.id} />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-12">
            {/* Biografía */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-light text-slate-800 mb-6 border-b border-slate-200 pb-4">
                Biografía
              </h2>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {memorial.biografia}
              </div>
            </div>

            {/* Logros y Reconocimientos */}
            {memorial.logros && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-light text-slate-800 mb-6 border-b border-slate-200 pb-4">
                  Logros y Reconocimientos
                </h2>
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {memorial.logros}
                </div>
              </div>
            )}

            {/* Comentarios Adicionales */}
            {memorial.comentarios && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-light text-slate-800 mb-6 border-b border-slate-200 pb-4">
                  Palabras de Familia
                </h2>
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap italic">
                  &ldquo;{memorial.comentarios}&rdquo;
                </div>
              </div>
            )}

            {/* Galería de fotos */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <MemorialGallery memorialId={memorial.id} />
            </div>

            {/* Sección de comentarios */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <MemorialComments memorialId={memorial.id} />
            </div>
          </div>

          {/* Barra lateral */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Código QR */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-light text-slate-800 mb-4 text-center">
                  Compartir Memorial
                </h3>
                <MemorialQR memorialId={memorial.id} />
              </div>

              {/* Información adicional */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-light text-slate-800 mb-4">
                  Información
                </h3>
                <div className="space-y-3 text-sm text-slate-600">
                  <div>
                    <span className="font-medium">Fecha de Nacimiento:</span>
                    <br />
                    <span className="text-slate-700">{formatDate(memorial.fecha_nacimiento)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Fecha de Fallecimiento:</span>
                    <br />
                    <span className="text-slate-700">{formatDate(memorial.fecha_fallecimiento)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 