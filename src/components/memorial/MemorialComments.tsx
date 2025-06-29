'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface Comment {
  id: string
  memorial_id: string | null
  user_id: string | null
  content: string
  created_at: string
}

interface MemorialCommentsProps {
  memorialId: string
}

export default function MemorialComments({ memorialId }: MemorialCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const loadComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('comentarios')
        .select('*')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('memorial_id', memorialId as any)
        .order('created_at', { ascending: false })

      if (error) throw error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setComments((data as any) || [])
    } catch (error) {
      console.error('Error al cargar comentarios:', error)
    }
  }, [memorialId])

  useEffect(() => {
    // Obtener el usuario actual
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // Cargar comentarios
    loadComments()

    // Suscribirse a nuevos comentarios
    const channel = supabase
      .channel('comments')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comentarios',
        filter: `memorial_id=eq.${memorialId}`
      }, () => {
        loadComments()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [memorialId, loadComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('comentarios')
        .insert([
          {
            memorial_id: memorialId,
            user_id: user.id,
            content: newComment.trim()
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ] as any)

      if (error) throw error
      setNewComment('')
    } catch (error) {
      console.error('Error al publicar comentario:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-light text-slate-800 mb-6 border-b border-slate-200 pb-4">
        Mensajes de Condolencias
      </h2>
      
      {/* Formulario de comentario */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Deja un mensaje de condolencia o un recuerdo especial..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 resize-none"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar Mensaje'}
          </button>
        </form>
      ) : (
        <div className="bg-slate-50 rounded-lg p-6 mb-8 text-center">
          <p className="text-slate-600">Inicia sesión para dejar un mensaje de condolencia</p>
        </div>
      )}

      {/* Lista de comentarios */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-slate-50 rounded-lg p-6 border-l-4 border-slate-300">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-slate-500 font-medium">{formatDate(comment.created_at)}</p>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap italic">
              &ldquo;{comment.content}&rdquo;
            </p>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No hay mensajes aún</p>
            <p className="text-slate-400 text-sm mt-2">Sé el primero en dejar un mensaje de condolencia</p>
          </div>
        )}
      </div>
    </div>
  )
} 