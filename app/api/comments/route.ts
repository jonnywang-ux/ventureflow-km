import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const contentType = searchParams.get('contentType')
  const contentId = searchParams.get('contentId')
  if (!contentType || !contentId) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('content_type', contentType as 'document' | 'article' | 'idea' | 'task')
    .eq('content_id', contentId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { team_id, content_type, content_id, body, parent_id } = await request.json()

  const { data, error } = await supabase
    .from('comments')
    .insert({ team_id, created_by: user.id, content_type, content_id, body, parent_id })
    .select('*, profiles(full_name, avatar_url)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
