import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
  'application/vnd.ms-excel': 'excel',
  'text/csv': 'excel',
  'text/markdown': 'markdown',
  'text/plain': 'markdown',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
}

const MAX_SIZE_MB = 50

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const teamId = formData.get('teamId') as string | null
  const title = formData.get('title') as string | null

  if (!file || !teamId) {
    return NextResponse.json({ error: 'Missing file or teamId' }, { status: 400 })
  }

  // Validate file type
  const fileType = ALLOWED_TYPES[file.type]
  if (!fileType) {
    return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 })
  }

  // Validate file size
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `File too large (max ${MAX_SIZE_MB}MB)` }, { status: 400 })
  }

  // Upload to Supabase Storage (admin client bypasses RLS; auth already verified above)
  const adminSupabase = createAdminClient()
  const storagePath = `${teamId}/${Date.now()}-${file.name}`
  const arrayBuffer = await file.arrayBuffer()
  const { error: storageError } = await adminSupabase.storage
    .from('documents')
    .upload(storagePath, arrayBuffer, { contentType: file.type })

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 })
  }

  // Create document record (admin client bypasses RLS; auth already verified above)
  const { data: document, error: dbError } = await adminSupabase
    .from('documents')
    .insert({
      team_id: teamId,
      created_by: user.id,
      title: title || file.name,
      file_name: file.name,
      file_type: fileType,
      file_size: file.size,
      storage_path: storagePath,
      storage_bucket: 'documents',
      status: 'pending',
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ documentId: document.id, status: 'pending' })
}
