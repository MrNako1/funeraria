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
  const [imageAspectRatio, setImageAspectRatio] = useState(16/9) // Aspecto por defecto
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('memorial_photos')
        .select('url')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('memorial_id', memorialId as any)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data && Array.isArray(data)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setPhotos((data as any[]).map(photo => photo.url))
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

  // Función para calcular el aspect ratio de la imagen actual
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    const aspectRatio = img.naturalWidth / img.naturalHeight
    setImageAspectRatio(aspectRatio)
  }

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          memorial_id: memorialId as any,
          url: publicUrl
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)

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

  // Calcular altura dinámica basada en el aspect ratio
  const getContainerHeight = () => {
    // Altura base responsiva
    const baseHeight = {
      sm: 'h-64',    // 256px en móviles
      md: 'h-80',    // 320px en tablets
      lg: 'h-96',    // 384px en desktop
      xl: 'h-[28rem]' // 448px en pantallas grandes
    }
    
    // Ajustar altura según el aspect ratio de la imagen
    if (imageAspectRatio > 1.5) {
      // Imágenes muy anchas (panorámicas)
      return {
        sm: 'h-48',
        md: 'h-64',
        lg: 'h-80',
        xl: 'h-96'
      }
    } else if (imageAspectRatio < 0.8) {
      // Imágenes muy altas (retratos)
      return {
        sm: 'h-80',
        md: 'h-96',
        lg: 'h-[28rem]',
        xl: 'h-[32rem]'
      }
    }
    
    return baseHeight
  }

  const containerHeight = getContainerHeight()

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
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-light text-slate-800">Galería de Recuerdos</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex items-center justify-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm sm:text-base"
        >
          <PhotoIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          {loading ? 'Subiendo...' : 'Agregar Foto'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {loading && photos.length === 0 ? (
        <div className={`${containerHeight.sm} sm:${containerHeight.md} lg:${containerHeight.lg} xl:${containerHeight.xl} bg-gray-100 rounded-lg flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : photos.length > 0 ? (
        <div className="relative">
          {/* Contenedor principal del carrusel con altura dinámica */}
          <div className={`relative ${containerHeight.sm} sm:${containerHeight.md} lg:${containerHeight.lg} xl:${containerHeight.xl} rounded-lg overflow-hidden bg-gray-100`}>
            <div 
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <Image
                src={photos[currentIndex]}
                alt={`Foto ${currentIndex + 1}`}
                fill
                className="object-contain" // Cambiado de object-cover a object-contain
                priority={currentIndex === 0}
                onLoad={handleImageLoad}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
              />
            </div>
            
            {/* Overlay sutil para mejorar la legibilidad de los controles */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Controles de navegación responsivos */}
          <button
            onClick={prevPhoto}
            disabled={loading || isTransitioning}
            className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 sm:p-3 rounded-full hover:bg-black/80 transition-all duration-300 ease-in-out transform hover:scale-110 ${
              isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
            }`}
          >
            <ChevronLeftIcon className="h-4 w-4 sm:h-6 sm:w-6" />
          </button>

          <button
            onClick={nextPhoto}
            disabled={loading || isTransitioning}
            className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 sm:p-3 rounded-full hover:bg-black/80 transition-all duration-300 ease-in-out transform hover:scale-110 ${
              isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
            }`}
          >
            <ChevronRightIcon className="h-4 w-4 sm:h-6 sm:w-6" />
          </button>

          {/* Indicadores de posición responsivos */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => goToPhoto(index)}
                disabled={loading || isTransitioning}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ease-in-out transform hover:scale-125 ${
                  index === currentIndex 
                    ? 'bg-white shadow-lg scale-110' 
                    : 'bg-white/60 hover:bg-white/80'
                } ${
                  isTransitioning ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              />
            ))}
          </div>

          {/* Contador de fotos responsivo */}
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/60 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      ) : (
        <div className={`${containerHeight.sm} sm:${containerHeight.md} lg:${containerHeight.lg} xl:${containerHeight.xl} bg-gray-100 rounded-lg flex items-center justify-center`}>
          <div className="text-center text-gray-500 px-4">
            <PhotoIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4" />
            <p className="text-sm sm:text-base">No hay fotos en la galería</p>
            <p className="text-xs sm:text-sm mt-1">Haz clic en &quot;Agregar Foto&quot; para comenzar</p>
          </div>
        </div>
      )}
    </div>
  )
} 