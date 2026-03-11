import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

  redirect('/onboarding')
}
