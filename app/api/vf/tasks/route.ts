import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: mem } = await supabase.from('team_members').select('team_id').eq('user_id', user.id).single()
  if (!mem) return NextResponse.json({ error: 'No team found' }, { status: 404 })

  const body = await req.json()
  const { data, error } = await supabase.from('tasks').insert({
    team_id: mem.team_id,
    created_by: user.id,
    title: body.title,
    description: body.desc || null,
    status: 'todo',
    priority: body.due === 'urgent' ? 'high' : body.due === 'soon' ? 'medium' : 'low',
    metadata: { owner: body.owner, due: body.due, cat: body.cat },
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    id: data.id, title: data.title, desc: data.description || '',
    owner: body.owner, due: body.due, cat: body.cat,
    status: 'open', done: false, ts: data.created_at,
  })
}
