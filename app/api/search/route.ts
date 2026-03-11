import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const teamId = searchParams.get('teamId')

  if (!q || !teamId) return NextResponse.json({ articles: [], documents: [], contacts: [], ideas: [] })

  const tsQuery = q.split(/\s+/).join(' & ')

  const [articles, documents, contacts, ideas] = await Promise.all([
    supabase
      .from('articles')
      .select('id, title, excerpt, status, created_at')
      .eq('team_id', teamId)
      .textSearch('title', tsQuery, { type: 'websearch' })
      .limit(10),
    supabase
      .from('documents')
      .select('id, title, ai_summary, status, created_at, file_type')
      .eq('team_id', teamId)
      .textSearch('title', tsQuery, { type: 'websearch' })
      .limit(10),
    supabase
      .from('contacts')
      .select('id, name, company, title, email')
      .eq('team_id', teamId)
      .textSearch('name', tsQuery, { type: 'websearch' })
      .limit(10),
    supabase
      .from('ideas')
      .select('id, title, description, status')
      .eq('team_id', teamId)
      .textSearch('title', tsQuery, { type: 'websearch' })
      .limit(10),
  ])

  return NextResponse.json({
    articles: articles.data ?? [],
    documents: documents.data ?? [],
    contacts: contacts.data ?? [],
    ideas: ideas.data ?? [],
  })
}
