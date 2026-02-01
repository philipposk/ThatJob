-- Storage buckets setup for ThatJob
-- Run this in Supabase SQL Editor after migrations

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('user-materials', 'user-materials', false, 10485760, ARRAY['application/pdf', 'application/rtf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('generated-documents', 'generated-documents', false, 10485760, ARRAY['application/pdf']),
  ('templates', 'templates', true, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for user-materials bucket
DROP POLICY IF EXISTS "Users can upload own materials" ON storage.objects;
CREATE POLICY "Users can upload own materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-materials' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can view own materials" ON storage.objects;
CREATE POLICY "Users can view own materials"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-materials' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update own materials" ON storage.objects;
CREATE POLICY "Users can update own materials"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-materials' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete own materials" ON storage.objects;
CREATE POLICY "Users can delete own materials"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-materials' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policies for generated-documents bucket
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'generated-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'generated-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policies for templates bucket (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view templates" ON storage.objects;
CREATE POLICY "Anyone can view templates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'templates');

DROP POLICY IF EXISTS "Service role can manage templates" ON storage.objects;
CREATE POLICY "Service role can manage templates"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'templates');
