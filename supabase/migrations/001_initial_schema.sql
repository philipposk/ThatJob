-- Initial database schema for ThatJob

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
