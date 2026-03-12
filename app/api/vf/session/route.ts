import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { session } } = await supabase.auth.getSession()
  const { data: mem } = await supabase
    .from('team_members').select('team_id').eq('user_id', user.id).single()

  return NextResponse.json({
    token: session?.access_token || '',
    teamId: mem?.team_id || '',
    userId: user.id,
  })
}
