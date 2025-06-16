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
        .eq('memorial_id', memorialId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setComments(data || [])
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
        ])

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
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Comentarios</h2>
      
      {/* Formulario de comentario */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Publicando...' : 'Publicar comentario'}
          </button>
        </form>
      ) : (
        <p className="text-gray-600 mb-6">Inicia sesión para dejar un comentario</p>
      )}

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-500">{formatDate(comment.created_at)}</p>
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-gray-500 text-center py-4">No hay comentarios aún</p>
        )}
      </div>
    </div>
  )
} 