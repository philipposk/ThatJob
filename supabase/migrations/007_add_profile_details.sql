-- Add detailed profile information to user_profiles

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS education_details JSONB DEFAULT '[]'::jsonb;

-- Education details structure:
-- [
--   {
--     "degree": "MSc Computational Physics",
--     "institution": "University of Copenhagen",
--     "field": "Physics",
--     "start_date": "2020-09-01",
--     "end_date": "2022-06-30",
--     "gpa": "3.8",
--     "thesis": "McStas misalignment tool",
--     "courses": [
--       {"name": "Machine Learning", "description": "..."},
--       {"name": "Data Science", "description": "..."}
--     ],
--     "institution_url": "https://..."
--   }
-- ]

-- Languages structure:
-- [
--   {"language": "English", "level": "Native"},
--   {"language": "Danish", "level": "Beginner (Module 3)"},
--   {"language": "Greek", "level": "Native"}
-- ]
