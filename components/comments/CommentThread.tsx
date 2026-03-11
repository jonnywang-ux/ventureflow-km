'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRelative, getInitials } from '@/lib/utils'
import { Send } from 'lucide-react'

interface CommentWithProfile {
  id: string
  body: string
  created_at: string
  parent_id: string | null
  profiles: { full_name: string | null; avatar_url: string | null } | null
}

interface Props {
  teamId: string
  contentType: 'document' | 'article' | 'idea' | 'task'
  contentId: string
}

export function CommentThread({ teamId, contentType, contentId }: Props) {
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/comments?contentType=${contentType}&contentId=${contentId}`)
    if (res.ok) setComments(await res.json())
  }, [contentType, contentId])

  useEffect(() => {
    fetchComments()

    // Subscribe to realtime
    const supabase = createClient()
    const channel = supabase
      .channel(`comments-${contentType}-${contentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `content_id=eq.${contentId}`,
        },
        () => fetchComments()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [contentType, contentId, fetchComments])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_id: teamId, content_type: contentType, content_id: contentId, body }),
    })
    setBody('')
    setLoading(false)
    fetchComments()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Comments ({comments.length})</h3>

      <div className="space-y-4 mb-5">
        {comments.length === 0 && (
          <p className="text-sm text-gray-400">No comments yet. Be the first.</p>
        )}
        {comments.map((c) => {
          const name = c.profiles?.full_name ?? 'Unknown'
          return (
            <div key={c.id} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 shrink-0">
                {getInitials(name)}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-gray-800">{name}</span>
                  <span className="text-xs text-gray-400">{formatRelative(c.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5">{c.body}</p>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
