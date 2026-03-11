import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeamProvider } from '@/components/layout/TeamProvider'
import { TopNav } from '@/components/layout/TopNav'

export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ teamSlug: string }>
}) {
  const { teamSlug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch team by slug
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('slug', teamSlug)
    .single()

  if (!team) redirect('/onboarding')

  // Fetch team membership + role
  const { data: member } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', team.id)
    .eq('user_id', user.id)
    .single()

  if (!member) redirect('/onboarding')

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <TeamProvider value={{ team, member, profile, role: member.role }}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
        <TopNav />
        <main style={{ flex: 1, padding: '32px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </TeamProvider>
  )
}
