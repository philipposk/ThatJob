-- Shared documents (read-only links)
CREATE TABLE IF NOT EXISTS shared_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES generated_documents(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job search preferences/profiles
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

-- Job matching scores (pre-generation assessment)
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
