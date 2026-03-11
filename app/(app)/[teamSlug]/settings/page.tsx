import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ teamSlug: string }>
}) {
  const { teamSlug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: team } = await supabase.from('teams').select('*').eq('slug', teamSlug).single()
  if (!team) redirect('/onboarding')

  const { data: members } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', team.id)
    .order('joined_at')

  // Fetch profiles separately
  const userIds = members?.map((m) => m.user_id) ?? []
  const { data: profiles } = userIds.length > 0
    ? await supabase.from('profiles').select('id, full_name, email, avatar_url').in('id', userIds)
    : { data: [] as { id: string; full_name: string | null; email: string; avatar_url: string | null }[] }
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      </div>

      {/* Team info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Team</h3>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Team name</label>
          <p className="text-sm font-medium text-gray-900">{team.name}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Team slug</label>
          <p className="text-sm font-mono text-gray-600">{team.slug}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Created</label>
          <p className="text-sm text-gray-600">{formatDate(team.created_at)}</p>
        </div>
      </div>

      {/* Members */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Members ({members?.length ?? 0})</h3>
        <div className="space-y-3">
          {members?.map((m) => {
            const profile = profileMap[m.user_id] ?? null
            return (
              <div key={m.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                    {(profile?.full_name ?? profile?.email ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{profile?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{profile?.email}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : m.role === 'editor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  {m.role}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
