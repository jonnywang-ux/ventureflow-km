-- Storage RLS policies for the "documents" bucket
-- Note: The bucket itself was created via the Supabase Storage API.
-- Run this SQL in the Supabase SQL Editor to apply access control policies.

-- Authenticated team editors/admins can upload documents
CREATE POLICY "team_members_upload_documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id::text = (storage.foldername(name))[1]
      AND user_id = auth.uid()
      AND role IN ('admin', 'editor')
  )
);

-- Team members can read documents in their team folder
CREATE POLICY "team_members_read_documents_storage"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id::text = (storage.foldername(name))[1]
      AND user_id = auth.uid()
  )
);

-- Team editors/admins can delete documents
CREATE POLICY "team_members_delete_documents_storage"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id::text = (storage.foldername(name))[1]
      AND user_id = auth.uid()
      AND role IN ('admin', 'editor')
  )
);
