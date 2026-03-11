import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, slug } = await request.json()
  if (!name || !slug) return NextResponse.json({ error: 'Missing name or slug' }, { status: 400 })

  // Use admin client to bypass RLS for team creation
  const admin = createAdminClient()

  const { data: team, error: teamError } = await admin
    .from('teams')
    .insert({ name, slug, created_by: user.id })
    .select()
    .single()

  if (teamError) return NextResponse.json({ error: teamError.message }, { status: 500 })

  const { error: memberError } = await admin
    .from('team_members')
    .insert({ team_id: team.id, user_id: user.id, role: 'admin' })

  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 })

  return NextResponse.json(team)
}
