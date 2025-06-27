import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { PhotoIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface MemorialGalleryProps {
  memorialId: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const GALLERY_BUCKET = 'memorial_gallery'

export default function MemorialGallery({ memorialId }: MemorialGalleryProps) {
  const [photos, setPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('memorial_photos')
        .select('url')
        .eq('memorial_id', memorialId)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) {
        setPhotos(data.map(photo => photo.url))
      }
    } catch (err) {
      console.error('Error al cargar las fotos:', err)
      setError('Error al cargar las fotos')
    } finally {
      setLoading(false)
    }
  }, [memorialId])

  useEffect(() => {
    fetchPhotos()
  }, [memorialId, fetchPhotos])

  const validateFile = (file: File): string | null => {
    if (!file) {
      return 'No se seleccionó ningún archivo'
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)'
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'El archivo es demasiado grande. El tamaño máximo permitido es 5MB'
    }

    return null
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const fileName = `${memorialId}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from(GALLERY_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(GALLERY_BUCKET)
        .getPublicUrl(fileName)

      const { error: insertError } = await supabase
        .from('memorial_photos')
        .insert({
          memorial_id: memorialId,
          url: publicUrl
        })

      if (insertError) throw insertError

      await fetchPhotos()
      setCurrentIndex(0)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error('Error al subir la foto:', err)
      setError('Error al subir la foto. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const nextPhoto = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length)
      setIsTransitioning(false)
    }, 300)
  }

  const prevPhoto = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
      setIsTransitioning(false)
    }, 300)
  }

  const goToPhoto = (index: number) => {
    if (isTransitioning || index === currentIndex) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 300)
  }

  return (
    <div className="relative">
      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-light text-slate-800">Galería de Recuerdos</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <PhotoIcon className="h-5 w-5 mr-2" />
          {loading ? 'Subiendo...' : 'Agregar Foto'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading && photos.length === 0 ? (
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : photos.length > 0 ? (
        <div className="relative">
          <div className="relative h-96 rounded-lg overflow-hidden bg-gray-100">
            <div 
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <Image
                src={photos[currentIndex]}
                alt={`Foto ${currentIndex + 1}`}
                fill
                className="object-cover"
                priority={currentIndex === 0}
              />
            </div>
            
            {/* Overlay sutil para mejorar la legibilidad de los controles */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Controles de navegación con transiciones suaves */}
          <button
            onClick={prevPhoto}
            disabled={loading || isTransitioning}
            className={`absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-all duration-300 ease-in-out transform hover:scale-110 ${
              isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
            }`}
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>

          <button
            onClick={nextPhoto}
            disabled={loading || isTransitioning}
            className={`absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-all duration-300 ease-in-out transform hover:scale-110 ${
              isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
            }`}
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>

          {/* Indicadores de posición con transiciones suaves */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => goToPhoto(index)}
                disabled={loading || isTransitioning}
                className={`w-3 h-3 rounded-full transition-all duration-300 ease-in-out transform hover:scale-125 ${
                  index === currentIndex 
                    ? 'bg-white shadow-lg scale-110' 
                    : 'bg-white/60 hover:bg-white/80'
                } ${
                  isTransitioning ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              />
            ))}
          </div>

          {/* Contador de fotos */}
          <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      ) : (
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <PhotoIcon className="h-16 w-16 mx-auto mb-4" />
            <p>No hay fotos en la galería</p>
            <p className="text-sm">Haz clic en &quot;Agregar Foto&quot; para comenzar</p>
          </div>
        </div>
      )}
    </div>
  )
} 