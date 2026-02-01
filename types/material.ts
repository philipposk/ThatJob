export type MaterialType = 
  | 'cv' 
  | 'cover_letter' 
  | 'degree' 
  | 'diploma' 
  | 'linkedin' 
  | 'github' 
  | 'portfolio' 
  | 'research' 
  | 'other';

export type FileType = 'pdf' | 'rtf' | 'txt' | 'url' | 'docx';

export interface UserMaterial {
  id: string;
  user_id: string;
  type: MaterialType;
  title: string | null;
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: FileType | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface MaterialUpload {
  file?: File;
  url?: string;
  type?: MaterialType;
  title?: string;
}
