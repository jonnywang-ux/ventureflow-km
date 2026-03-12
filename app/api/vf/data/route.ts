import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: mem } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .single()
  if (!mem) return NextResponse.json({ error: 'No team found' }, { status: 404 })
  const teamId = mem.team_id

  const [contacts, ideas, tasks, notes, documents] = await Promise.all([
    supabase.from('contacts').select('*, source_document_id').eq('team_id', teamId).order('created_at', { ascending: false }),
    supabase.from('ideas').select('*, source_document_id').eq('team_id', teamId).order('created_at', { ascending: false }),
    supabase.from('tasks').select('*, source_document_id').eq('team_id', teamId).order('created_at', { ascending: false }),
    supabase.from('articles').select('*').eq('team_id', teamId).eq('status', 'draft').order('created_at', { ascending: false }),
    supabase.from('documents').select('id, title, file_name, file_type, file_size, status, created_at, ai_summary, ai_metadata').eq('team_id', teamId).order('created_at', { ascending: false }),
  ])

  // Map Supabase rows to ventureflow.html shape
  const mappedContacts = (contacts.data || []).map(c => ({
    id: c.id,
    name: c.name,
    org: c.company || '',
    role: c.title || '',
    email: c.email || '',
    notes: c.notes || '',
    region: (c.metadata as Record<string, string>)?.region || 'other',
    type: (c.metadata as Record<string, string>)?.type || 'other',
    warm: (c.metadata as Record<string, string>)?.warm || 'cold',
    by: (c.metadata as Record<string, string>)?.by || 'A',
    source_document_id: c.source_document_id,
    ts: c.created_at,
  }))

  const mappedIdeas = (ideas.data || []).map(i => ({
    id: i.id,
    title: i.title,
    desc: i.description || '',
    cat: i.category || '',
    market: (i.metadata as Record<string, number>)?.market || 3,
    exec: (i.metadata as Record<string, number>)?.exec || 3,
    origin: (i.metadata as Record<string, string>)?.origin || '',
    source: (i.metadata as Record<string, string>)?.source || '',
    by: (i.metadata as Record<string, string>)?.by || 'A',
    source_document_id: i.source_document_id,
    ts: i.created_at,
  }))

  const mappedTasks = (tasks.data || []).map(t => ({
    id: t.id,
    title: t.title,
    desc: t.description || '',
    owner: (t.metadata as Record<string, string>)?.owner || 'A',
    due: (t.metadata as Record<string, string>)?.due || 'normal',
    cat: (t.metadata as Record<string, string>)?.cat || 'general',
    status: t.status === 'done' ? 'done' : 'open',
    done: t.status === 'done',
    source_document_id: t.source_document_id,
    ts: t.created_at,
  }))

  const mappedNotes = (notes.data || []).map(n => ({
    id: n.id,
    title: n.title,
    body: n.content_text || '',
    type: (n.metadata as Record<string, string>)?.type || 'general',
    linked: (n.metadata as Record<string, string>)?.linked || null,
    by: (n.metadata as Record<string, string>)?.by || 'A',
    pinned: (n.metadata as Record<string, boolean>)?.pinned || false,
    ts: n.created_at,
  }))

  const mappedDocs = (documents.data || []).map(d => ({
    id: d.id,
    title: d.title || d.file_name,
    file_name: d.file_name,
    file_type: d.file_type,
    file_size: d.file_size,
    status: d.status,
    ai_summary: d.ai_summary,
    industry_tags: ((d.ai_metadata as Record<string, unknown>)?.industrySegments as string[]) || [],
    created_at: d.created_at,
  }))

  return NextResponse.json({
    contacts: mappedContacts,
    ideas: mappedIdeas,
    tasks: mappedTasks,
    notes: mappedNotes,
    documents: mappedDocs,
    teamId,
  })
}
