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
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Galería de Fotos</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <PhotoIcon className="h-5 w-5 mr-2" />
          {loading ? 'Subiendo...' : 'Agregar Foto'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_FILE_TYPES.join(',')}
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />
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
          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image
              src={photos[currentIndex]}
              alt={`Foto ${currentIndex + 1}`}
              fill
              className="object-cover"
              priority={currentIndex === 0}
            />
          </div>

          <button
            onClick={prevPhoto}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            disabled={loading}
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>

          <button
            onClick={nextPhoto}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            disabled={loading}
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                disabled={loading}
              />
            ))}
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