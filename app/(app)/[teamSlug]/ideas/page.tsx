import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Lightbulb } from 'lucide-react'

const STATUS_ORDER = ['new', 'in-review', 'approved', 'rejected', 'archived'] as const
const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  'in-review': 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  archived: 'Archived',
}
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 border-blue-200',
  'in-review': 'bg-yellow-50 border-yellow-200',
  approved: 'bg-green-50 border-green-200',
  rejected: 'bg-red-50 border-red-200',
  archived: 'bg-gray-50 border-gray-200',
}

export default async function IdeasPage({
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

  const { data: ideas } = await supabase
    .from('ideas')
    .select('*')
    .eq('team_id', team.id)
    .order('created_at', { ascending: false })

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = ideas?.filter((i) => i.status === status) ?? []
    return acc
  }, {} as Record<string, typeof ideas>)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ideas</h2>
        <p className="text-sm text-gray-500 mt-1">{ideas?.length ?? 0} ideas — auto-extracted from documents + manually added</p>
      </div>

      {!ideas || ideas.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No ideas yet</p>
          <p className="text-sm mt-1">Upload documents to auto-extract business ideas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {STATUS_ORDER.map((status) => (
            <div key={status} className={`rounded-xl border p-4 ${STATUS_COLORS[status]}`}>
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                {STATUS_LABELS[status]} ({grouped[status]?.length ?? 0})
              </h3>
              <div className="space-y-2">
                {grouped[status]?.map((idea) => (
                  <div key={idea.id} className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm">
                    <p className="text-sm font-medium text-gray-800">{idea.title}</p>
                    {idea.category && (
                      <span className="inline-block mt-1 text-xs px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded">
                        {idea.category}
                      </span>
                    )}
                    {idea.description && (
                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-3">{idea.description}</p>
                    )}
                    {idea.source_document_id && (
                      <Link href={`/${teamSlug}/documents/${idea.source_document_id}`} className="text-xs text-indigo-500 hover:underline mt-1.5 block">
                        Source →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
