import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { CommentThread } from '@/components/comments/CommentThread'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { Edit } from 'lucide-react'

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ teamSlug: string; id: string }>
}) {
  const { teamSlug, id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: team } = await supabase.from('teams').select('id').eq('slug', teamSlug).single()
  if (!team) redirect('/onboarding')

  const { data: article } = await supabase.from('articles').select('*').eq('id', id).single()
  if (!article) notFound()

  // Increment view count (fire and forget, ignore errors)
  void supabase.from('articles').update({ view_count: (article.view_count ?? 0) + 1 }).eq('id', id)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {article.status}
            </span>
            <span className="text-xs text-gray-400">{formatDate(article.created_at)}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{article.title}</h1>
        </div>
        <Link
          href={`/${teamSlug}/articles/${id}/edit`}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <RichTextEditor content={article.content as object} readOnly />
      </div>

      <CommentThread teamId={team.id} contentType="article" contentId={id} />
    </div>
  )
}
