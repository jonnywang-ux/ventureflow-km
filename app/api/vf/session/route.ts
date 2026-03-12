import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const GUNUNG_SLUG = 'gunung-capital'
const GUNUNG_NAME = 'Gunung Capital'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { session } } = await supabase.auth.getSession()

  let { data: mem } = await supabase
    .from('team_members').select('team_id').eq('user_id', user.id).single()

  // Auto-join Gunung Team if no team membership exists
  if (!mem) {
    const admin = createAdminClient()
    let { data: team } = await admin.from('teams').select('id').eq('slug', GUNUNG_SLUG).single()
    if (!team) {
      const { data: newTeam } = await admin.from('teams')
        .insert({ name: GUNUNG_NAME, slug: GUNUNG_SLUG, created_by: user.id })
        .select('id').single()
      team = newTeam
    }
    if (team) {
      await admin.from('team_members')
        .upsert({ team_id: team.id, user_id: user.id, role: 'editor' }, { onConflict: 'team_id,user_id' })
      mem = { team_id: team.id }
    }
  }

  return NextResponse.json({
    token: session?.access_token || '',
    teamId: mem?.team_id || '',
    userId: user.id,
  })
}
