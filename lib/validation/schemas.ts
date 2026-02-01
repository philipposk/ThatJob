import { z } from 'zod';

// Material upload schemas
export const materialUploadSchema = z.object({
  type: z.enum(['cv', 'cover_letter', 'degree', 'diploma', 'linkedin', 'github', 'portfolio', 'research', 'other']),
  title: z.string().optional(),
  url: z.string().url().optional(),
});

// Job posting schemas
export const jobPostingSchema = z.object({
  url: z.string().url().optional(),
  description: z.string().min(50).optional(),
  preference_id: z.string().uuid().optional(),
}).refine((data) => data.url || data.description, {
  message: "Either url or description must be provided",
});

// Generation schemas
export const generateDocumentSchema = z.object({
  job_posting_id: z.string().uuid(),
  generate_cv: z.boolean().default(true),
  generate_cover: z.boolean().default(true),
  alignment_level: z.enum(['10', '30', '50', '70', '90']).default('50'),
  export_format: z.enum(['linkedin', 'indeed', 'ats-friendly', 'company-website', 'generic']).default('generic'),
  template_id: z.string().uuid().optional(),
});

// Chat schemas
export const chatMessageSchema = z.object({
  conversation_id: z.string().uuid().optional(),
  message: z.string().min(1).max(2000),
  document_id: z.string().uuid().optional(),
});

// Feedback schemas
export const feedbackSchema = z.object({
  document_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// Preference schemas
export const jobPreferenceSchema = z.object({
  name: z.string().min(1).max(100),
  industries: z.array(z.string()).default([]),
  roles: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  experience_level: z.enum(['entry', 'mid', 'senior', 'lead']).optional(),
  alignment_level: z.number().min(10).max(90).default(50),
  preferred_platforms: z.array(z.string()).default([]),
  is_default: z.boolean().default(false),
});
