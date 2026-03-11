import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DocumentsClient } from './DocumentsClient'

export default async function DocumentsPage({
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

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('team_id', team.id)
    .order('created_at', { ascending: false })

  return <DocumentsClient teamId={team.id} teamSlug={teamSlug} initialDocs={documents ?? []} />
}
