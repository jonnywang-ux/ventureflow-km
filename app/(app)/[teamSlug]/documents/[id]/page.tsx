import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { CommentThread } from '@/components/comments/CommentThread'
import { AIExtractionPanel } from '@/components/documents/AIExtractionPanel'
import type { ExtractionResult } from '@/lib/types/extraction'

export default async function DocumentDetailPage({
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

  const { data: doc } = await supabase.from('documents').select('*').eq('id', id).single()
  if (!doc) notFound()

  // Fetch tags via two-step query to avoid join type inference issues
  const { data: contentTags } = await supabase
    .from('content_tags')
    .select('tag_id')
    .eq('content_type', 'document')
    .eq('content_id', id)

  const tagIds = contentTags?.map((ct) => ct.tag_id) ?? []
  const { data: tagRows } = tagIds.length > 0
    ? await supabase.from('tags').select('id, name, color').in('id', tagIds)
    : { data: [] as { id: string; name: string; color: string }[] }
  const tags = tagRows ?? []
  const aiData = doc.ai_metadata as ExtractionResult | null

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{doc.title}</h2>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>{doc.file_name}</span>
          <span>•</span>
          <span>{formatDate(doc.created_at)}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${doc.status === 'ready' ? 'bg-green-100 text-green-700' : doc.status === 'processing' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
            {doc.status}
          </span>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <span key={tag.id} className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: tag.color }}>
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {doc.ai_summary && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">AI Summary</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{doc.ai_summary}</p>
            </div>
          )}

          {aiData && <AIExtractionPanel data={aiData} teamSlug={teamSlug} />}

          <CommentThread
            teamId={team.id}
            contentType="document"
            contentId={id}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">File Info</h3>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-gray-500">Type</dt><dd className="text-gray-800 font-medium capitalize">{doc.file_type}</dd></div>
              {doc.file_size && <div><dt className="text-gray-500">Size</dt><dd className="text-gray-800 font-medium">{(doc.file_size / 1024 / 1024).toFixed(2)} MB</dd></div>}
              <div><dt className="text-gray-500">Uploaded</dt><dd className="text-gray-800 font-medium">{formatDate(doc.created_at)}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
