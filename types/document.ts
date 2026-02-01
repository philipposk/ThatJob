export type DocumentType = 'cv' | 'cover_letter' | 'both' | 'merged';

export type ExportFormat = 'linkedin' | 'indeed' | 'ats-friendly' | 'company-website' | 'generic';

export type AlignmentLevel = 10 | 30 | 50 | 70 | 90;

export interface Citation {
  section: string;
  claim: string;
  source: string;
  line?: number;
  material_id?: string;
}

export interface DocumentIteration {
  version: number;
  content: string;
  timestamp: string;
  changes: string[];
  alignment_score?: AlignmentLevel;
}

export interface GeneratedDocument {
  id: string;
  user_id: string;
  job_posting_id: string | null;
  type: DocumentType;
  cv_content: string | null;
  cover_content: string | null;
  cv_pdf_url: string | null;
  cover_pdf_url: string | null;
  merged_pdf_url: string | null;
  alignment_score: AlignmentLevel | null;
  citations: Citation[];
  iterations: DocumentIteration[];
  feedback_rating: number | null;
  feedback_comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentTemplate {
  id: string;
  user_id: string | null;
  name: string;
  type: 'cv' | 'cover_letter';
  template_data: Record<string, any>;
  is_default: boolean;
  created_at: string;
}
