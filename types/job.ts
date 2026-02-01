export interface JobPosting {
  id: string;
  user_id: string;
  url: string | null;
  title: string | null;
  company: string | null;
  description: string | null;
  requirements: JobRequirements | null;
  company_info: CompanyInfo | null;
  created_at: string;
}

export interface JobRequirements {
  skills: string[];
  experience_years?: number;
  experience_level?: 'entry' | 'mid' | 'senior' | 'lead';
  education?: string[];
  responsibilities: string[];
  preferred_qualifications?: string[];
}

export interface CompanyInfo {
  name: string;
  values: string[];
  culture: string[];
  mission: string | null;
  recent_news: string[];
  ethics: string[];
  sustainability?: string[];
  website?: string;
  linkedin?: string;
}

export interface JobMatchingScore {
  id: string;
  user_id: string;
  job_posting_id: string;
  overall_score: number;
  skills_match: number;
  experience_match: number;
  education_match: number;
  culture_fit: number;
  match_details: MatchDetails;
  created_at: string;
}

export interface MatchDetails {
  matching_skills: string[];
  missing_skills: string[];
  experience_gap?: string;
  education_match: boolean;
  culture_alignment: string[];
}

export interface JobPreference {
  id: string;
  user_id: string;
  name: string;
  industries: string[];
  roles: string[];
  skills: string[];
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | null;
  alignment_level: number;
  preferred_platforms: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
