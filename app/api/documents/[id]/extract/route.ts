import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { extractFromText, extractFromImage } from '@/lib/ai/extraction'
import { parsePdf } from '@/lib/parsers/pdf'
import { parseExcel } from '@/lib/parsers/excel'
import { parseWord } from '@/lib/parsers/word'
import { parseMarkdown } from '@/lib/parsers/markdown'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch document record
  const { data: doc } = await supabase.from('documents').select('*').eq('id', id).single()
  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

  // Update status to processing
  await supabase.from('documents').update({ status: 'processing' }).eq('id', id)

  try {
    // Download file from storage
    const { data: fileData, error: downloadError } = await adminSupabase.storage
      .from('documents')
      .download(doc.storage_path)

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`)
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())
    let result

    if (doc.file_type === 'image') {
      const base64 = buffer.toString('base64')
      const mimeMap: Record<string, 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'> = {
        jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
      }
      const ext = doc.file_name.split('.').pop()?.toLowerCase() ?? 'png'
      const mediaType = mimeMap[ext] ?? 'image/png'
      result = await extractFromImage(base64, mediaType)
    } else {
      let text = ''
      if (doc.file_type === 'pdf') text = await parsePdf(buffer)
      else if (doc.file_type === 'excel') text = parseExcel(buffer)
      else if (doc.file_type === 'word') text = await parseWord(buffer)
      else text = parseMarkdown(buffer.toString('utf-8'))
      result = await extractFromText(text)

      // Save raw text
      await supabase.from('documents').update({ raw_text: text.slice(0, 500000) }).eq('id', id)
    }

    // Save AI results
    await supabase.from('documents').update({
      ai_summary: result.summary,
      ai_metadata: result as unknown as import('@/lib/types/database').Json,
      status: 'ready',
      updated_at: new Date().toISOString(),
    }).eq('id', id)

    // Auto-create tags from suggestedTags
    for (const tagName of result.suggestedTags) {
      const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const { data: tag } = await supabase
        .from('tags')
        .upsert({ team_id: doc.team_id, name: tagName, slug, created_by: user.id }, { onConflict: 'team_id,slug' })
        .select()
        .single()
      if (tag) {
        await supabase.from('content_tags').upsert(
          { tag_id: tag.id, content_type: 'document', content_id: id },
          { onConflict: 'tag_id,content_type,content_id' }
        )
      }
    }

    // Save extracted contacts
    for (const c of result.contacts) {
      await supabase.from('contacts').insert({
        team_id: doc.team_id,
        created_by: user.id,
        name: c.name,
        title: c.title,
        company: c.company,
        email: c.email,
        phone: c.phone,
        linkedin_url: c.linkedin,
        notes: c.notes,
        source_document_id: id,
      })
    }

    // Save extracted ideas
    for (const idea of result.ideas) {
      await supabase.from('ideas').insert({
        team_id: doc.team_id,
        created_by: user.id,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        source_document_id: id,
      })
    }

    // Save extracted tasks
    for (const action of result.actions) {
      await supabase.from('tasks').insert({
        team_id: doc.team_id,
        created_by: user.id,
        title: action.title,
        description: action.description,
        priority: action.priority ?? 'medium',
        source_document_id: id,
      })
    }

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Extraction failed'
    await supabase.from('documents').update({ status: 'error' }).eq('id', id)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
