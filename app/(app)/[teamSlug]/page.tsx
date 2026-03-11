import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, FolderOpen, Users, Lightbulb, CheckSquare, Plus } from 'lucide-react'
import { formatRelative } from '@/lib/utils'

export default async function DashboardPage({
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

  const [
    { count: docCount },
    { count: articleCount },
    { count: contactCount },
    { count: ideaCount },
    { count: taskCount },
    { data: recentDocs },
    { data: recentArticles },
  ] = await Promise.all([
    supabase.from('documents').select('*', { count: 'exact', head: true }).eq('team_id', team.id),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('team_id', team.id),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('team_id', team.id),
    supabase.from('ideas').select('*', { count: 'exact', head: true }).eq('team_id', team.id),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('team_id', team.id).neq('status', 'done'),
    supabase.from('documents').select('id, title, created_at, status').eq('team_id', team.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('articles').select('id, title, created_at, status').eq('team_id', team.id).order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Documents', value: docCount ?? 0, icon: FolderOpen, href: `/${teamSlug}/documents`, color: 'bg-blue-50 text-blue-600' },
    { label: 'Articles', value: articleCount ?? 0, icon: FileText, href: `/${teamSlug}/articles`, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Contacts', value: contactCount ?? 0, icon: Users, href: `/${teamSlug}/contacts`, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Ideas', value: ideaCount ?? 0, icon: Lightbulb, href: `/${teamSlug}/ideas`, color: 'bg-amber-50 text-amber-600' },
    { label: 'Open Tasks', value: taskCount ?? 0, icon: CheckSquare, href: `/${teamSlug}/tasks`, color: 'bg-rose-50 text-rose-600' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Overview of your team knowledge base</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
          >
            <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Link
          href={`/${teamSlug}/documents`}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Upload Document
        </Link>
        <Link
          href={`/${teamSlug}/articles/new`}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Article
        </Link>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Documents</h3>
            <Link href={`/${teamSlug}/documents`} className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentDocs && recentDocs.length > 0 ? recentDocs.map((doc) => (
              <Link key={doc.id} href={`/${teamSlug}/documents/${doc.id}`} className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1 rounded">
                <span className="text-sm text-gray-800 truncate">{doc.title}</span>
                <span className={`text-xs ml-2 shrink-0 px-1.5 py-0.5 rounded-full ${doc.status === 'ready' ? 'bg-green-100 text-green-700' : doc.status === 'processing' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{doc.status}</span>
              </Link>
            )) : (
              <p className="text-sm text-gray-400">No documents yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Articles</h3>
            <Link href={`/${teamSlug}/articles`} className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentArticles && recentArticles.length > 0 ? recentArticles.map((article) => (
              <Link key={article.id} href={`/${teamSlug}/articles/${article.id}`} className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1 rounded">
                <span className="text-sm text-gray-800 truncate">{article.title}</span>
                <span className="text-xs text-gray-400 ml-2 shrink-0">{formatRelative(article.created_at)}</span>
              </Link>
            )) : (
              <p className="text-sm text-gray-400">No articles yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
