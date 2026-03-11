import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { formatRelative } from '@/lib/utils'

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ teamSlug: string }>
}) {
  const { teamSlug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: team } = await supabase.from('teams').select('id').eq('slug', teamSlug).single()
  if (!team) redirect('/onboarding')

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('team_id', team.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
          <p className="text-sm text-gray-500 mt-1">Create and share knowledge articles with your team</p>
        </div>
        <Link
          href={`/${teamSlug}/articles/new`}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Article
        </Link>
      </div>

      {!articles || articles.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No articles yet</p>
          <p className="text-sm mt-1">Create your first article to share knowledge with your team</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/${teamSlug}/articles/${article.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {article.title}
                  </p>
                  {article.excerpt && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${article.status === 'published' ? 'bg-green-100 text-green-700' : article.status === 'draft' ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-700'}`}>
                    {article.status}
                  </span>
                  <span className="text-xs text-gray-400">{formatRelative(article.updated_at)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
