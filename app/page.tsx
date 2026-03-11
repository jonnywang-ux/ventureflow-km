import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Find the user's first team membership
  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (membership?.team_id) {
    const { data: team } = await supabase
      .from('teams')
      .select('slug')
      .eq('id', membership.team_id)
      .single()
    if (team?.slug) redirect(`/${team.slug}`)
  }

  // Auto-create default "gunung" team for new users
  const admin = createAdminClient()

  // Check if the default team already exists
  const { data: existingTeam } = await admin
    .from('teams')
    .select('id, slug')
    .eq('slug', 'gunung')
    .single()

  let teamId: string
  let teamSlug: string

  if (existingTeam) {
    teamId = existingTeam.id
    teamSlug = existingTeam.slug
  } else {
    const { data: newTeam } = await admin
      .from('teams')
      .insert({ name: 'Gunung Capital', slug: 'gunung', created_by: user.id })
      .select('id, slug')
      .single()
    if (!newTeam) redirect('/onboarding')
    teamId = newTeam.id
    teamSlug = newTeam.slug
  }

  // Add user as admin member
  await admin.from('team_members').insert({
    team_id: teamId,
    user_id: user.id,
    role: 'admin',
  })

  redirect(`/${teamSlug}`)
}
