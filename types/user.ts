export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserAIProfile {
  id: string;
  user_id: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  summary: string | null;
  last_updated: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  start_date: string;
  end_date: string | null;
  description: string;
  skills: string[];
}

export interface Education {
  degree: string;
  institution: string;
  field: string;
  start_date: string;
  end_date: string | null;
  gpa?: string;
  thesis?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  start_date?: string;
  end_date?: string;
}
