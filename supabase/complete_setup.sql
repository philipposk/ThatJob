-- Complete Supabase Setup for ThatJob
-- Run this entire file in Supabase SQL Editor (one go)
-- Project: https://supabase.com/dashboard/project/ghypcaqrdclhfppabgjs

-- ============================================
-- MIGRATION 001: Initial Schema
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User materials (Phase 1)
CREATE TABLE IF NOT EXISTS user_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cv', 'cover_letter', 'degree', 'diploma', 'linkedin', 'github', 'portfolio', 'research', 'other')),
  title TEXT,
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT CHECK (file_type IN ('pdf', 'rtf', 'txt', 'url', 'docx')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI learning cache (processed user data)
CREATE TABLE IF NOT EXISTS user_ai_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  skills JSONB,
  experience JSONB,
  education JSONB,
  projects JSONB,
  summary TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Job postings
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT,
  title TEXT,
  company TEXT,
  description TEXT,
  requirements JSONB,
  company_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated documents
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_posting_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('cv', 'cover_letter', 'both', 'merged')),
  cv_content TEXT,
  cover_content TEXT,
  cv_pdf_url TEXT,
  cover_pdf_url TEXT,
  merged_pdf_url TEXT,
  alignment_score INTEGER CHECK (alignment_score IN (10, 30, 50, 70, 90)),
  citations JSONB,
  iterations JSONB,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_materials_user_type ON user_materials(user_id, type);
CREATE INDEX IF NOT EXISTS idx_user_materials_user_created ON user_materials(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_postings_user_created ON job_postings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_documents_user_created ON generated_documents(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_documents_job ON generated_documents(job_posting_id);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- User materials policies
CREATE POLICY "Users can view own materials" ON user_materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own materials" ON user_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own materials" ON user_materials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own materials" ON user_materials FOR DELETE USING (auth.uid() = user_id);

-- AI profile policies
CREATE POLICY "Users can view own AI profile" ON user_ai_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own AI profile" ON user_ai_profile FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own AI profile" ON user_ai_profile FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Job postings policies
CREATE POLICY "Users can view own job postings" ON job_postings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own job postings" ON job_postings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own job postings" ON job_postings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own job postings" ON job_postings FOR DELETE USING (auth.uid() = user_id);

-- Generated documents policies
CREATE POLICY "Users can view own documents" ON generated_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON generated_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON generated_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON generated_documents FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- MIGRATION 002: Templates
-- ============================================

CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cv', 'cover_letter')),
  template_data JSONB,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_user_type ON document_templates(user_id, type);

ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view system templates" ON document_templates FOR SELECT USING (user_id IS NULL);
CREATE POLICY "Users can view own templates" ON document_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON document_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON document_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON document_templates FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- MIGRATION 003: Analytics
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_user_event ON analytics_events(user_id, event_type, created_at DESC);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics" ON analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- MIGRATION 004: Queue
-- ============================================

CREATE TABLE IF NOT EXISTS processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payload JSONB,
  result JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_processing_queue_status ON processing_queue(status, created_at);

ALTER TABLE processing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own queue items" ON processing_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own queue items" ON processing_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own queue items" ON processing_queue FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- MIGRATION 005: Preferences
-- ============================================

CREATE TABLE IF NOT EXISTS shared_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES generated_documents(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industries TEXT[],
  roles TEXT[],
  skills TEXT[],
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead')),
  alignment_level INTEGER DEFAULT 50 CHECK (alignment_level IN (10, 30, 50, 70, 90)),
  preferred_platforms TEXT[],
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_matching_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  skills_match INTEGER CHECK (skills_match >= 0 AND skills_match <= 100),
  experience_match INTEGER CHECK (experience_match >= 0 AND experience_match <= 100),
  education_match INTEGER CHECK (education_match >= 0 AND education_match <= 100),
  culture_fit INTEGER CHECK (culture_fit >= 0 AND culture_fit <= 100),
  match_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_documents_token ON shared_documents(share_token);
CREATE INDEX IF NOT EXISTS idx_job_preferences_user ON job_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matching_scores_user_job ON job_matching_scores(user_id, job_posting_id);

ALTER TABLE shared_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matching_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON job_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON job_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON job_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences" ON job_preferences FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own matching scores" ON job_matching_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own matching scores" ON job_matching_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view shared documents by token" ON shared_documents FOR SELECT USING (true);
CREATE POLICY "Users can create shared links for own documents" ON shared_documents FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM generated_documents 
      WHERE generated_documents.id = shared_documents.document_id 
      AND generated_documents.user_id = auth.uid()
    )
  );

-- ============================================
-- MIGRATION 006: Chat
-- ============================================

CREATE TABLE IF NOT EXISTS ai_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  document_id UUID REFERENCES generated_documents(id) ON DELETE SET NULL,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_chat_conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES ai_chat_messages(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('edit_document', 'create_similar', 'regenerate', 'export')),
  target_document_id UUID REFERENCES generated_documents(id) ON DELETE SET NULL,
  new_document_id UUID REFERENCES generated_documents(id) ON DELETE SET NULL,
  action_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON ai_chat_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON ai_chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_actions_conversation ON chat_actions(conversation_id);

ALTER TABLE ai_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON ai_chat_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON ai_chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON ai_chat_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON ai_chat_conversations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in own conversations" ON ai_chat_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM ai_chat_conversations 
      WHERE ai_chat_conversations.id = ai_chat_messages.conversation_id 
      AND ai_chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own conversations" ON ai_chat_messages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_chat_conversations 
      WHERE ai_chat_conversations.id = ai_chat_messages.conversation_id 
      AND ai_chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view actions in own conversations" ON chat_actions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM ai_chat_conversations 
      WHERE ai_chat_conversations.id = chat_actions.conversation_id 
      AND ai_chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert actions in own conversations" ON chat_actions FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_chat_conversations 
      WHERE ai_chat_conversations.id = chat_actions.conversation_id 
      AND ai_chat_conversations.user_id = auth.uid()
    )
  );

-- ============================================
-- STORAGE BUCKETS SETUP
-- ============================================

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
