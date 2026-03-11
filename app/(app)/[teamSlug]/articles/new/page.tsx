'use client'

import { use, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { useTeam } from '@/lib/hooks/useTeam'
import { Save } from 'lucide-react'

export default function NewArticlePage({
  params,
}: {
  params: Promise<{ teamSlug: string }>
}) {
  const { teamSlug } = use(params)
  const router = useRouter()
  const { team } = useTeam()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<object>({})
  const [contentText, setContentText] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'draft' | 'published'>('draft')

  const handleEditorChange = useCallback((json: object, text: string) => {
    setContent(json)
    setContentText(text)
  }, [])

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_id: team.id,
        title,
        content,
        content_text: contentText,
        excerpt: contentText.slice(0, 200),
        status,
      }),
    })
    if (res.ok) {
      const article = await res.json()
      router.push(`/${teamSlug}/articles/${article.id}`)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">New Article</h2>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
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
        <RichTextEditor
          onChange={handleEditorChange}
          placeholder="Start writing your article..."
        />
      </div>
    </div>
  )
}
