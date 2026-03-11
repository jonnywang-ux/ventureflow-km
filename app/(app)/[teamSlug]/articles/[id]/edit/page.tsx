'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { Save, Trash2 } from 'lucide-react'

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ teamSlug: string; id: string }>
}) {
  const { teamSlug, id } = use(params)
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<object>({})
  const [contentText, setContentText] = useState('')
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((r) => r.json())
      .then((a) => {
        setTitle(a.title)
        setContent(a.content)
        setContentText(a.content_text ?? '')
        setStatus(a.status)
        setLoading(false)
      })
  }, [id])

  const handleEditorChange = useCallback((json: object, text: string) => {
    setContent(json)
    setContentText(text)
  }, [])

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/articles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, content_text: contentText, excerpt: contentText.slice(0, 200), status }),
    })
    setSaving(false)
    router.push(`/${teamSlug}/articles/${id}`)
  }

  async function handleDelete() {
    if (!confirm('Delete this article?')) return
    await fetch(`/api/articles/${id}`, { method: 'DELETE' })
    router.push(`/${teamSlug}/articles`)
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Edit Article</h2>
        <div className="flex items-center gap-2">
          <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article title..."
          className="w-full text-2xl font-bold border-0 outline-none placeholder:text-gray-300 text-gray-900"
        />
        <hr className="border-gray-100" />
        <RichTextEditor content={content} onChange={handleEditorChange} />
      </div>
    </div>
  )
}
