import { callAIWithFallback, OPENAI_MODEL } from '../openai/client';
import { logger } from '../logger';

export interface ATSScore {
  overall: number;
  keywords: number;
  formatting: number;
  structure: number;
  issues: string[];
  suggestions: string[];
}

export async function analyzeATS(cvContent: string): Promise<ATSScore> {
  try {
    const prompt = `Analyze this CV for ATS (Applicant Tracking System) compatibility:

${cvContent}

Evaluate:
1. Keyword optimization (0-100)
2. Formatting compatibility (0-100)
3. Structure and sections (0-100)
4. Overall ATS score (0-100)
5. Issues found (array of strings)
6. Suggestions for improvement (array of strings)

Return ONLY valid JSON:
{
  "overall": 85,
  "keywords": 90,
  "formatting": 80,
  "structure": 85,
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`;

    const response = await callAIWithFallback(
      [
        {
          role: 'system',
          content: 'You are an ATS optimization expert. Analyze CVs for ATS compatibility. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        model: OPENAI_MODEL,
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }
    );

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as ATSScore;
  } catch (error) {
    logger.error('Error analyzing ATS', { error });
    return {
      overall: 0,
      keywords: 0,
      formatting: 0,
      structure: 0,
      issues: ['Failed to analyze'],
      suggestions: [],
    };
  }
}

export function optimizeForATS(cvContent: string): string {
  // Basic ATS optimizations
  let optimized = cvContent;

  // Remove special characters that ATS might not parse
  optimized = optimized.replace(/[^\w\s\-.,;:!?()]/g, ' ');

  // Ensure standard section headers
  optimized = optimized.replace(/profile|summary/gi, 'PROFESSIONAL SUMMARY');
  optimized = optimized.replace(/experience|work experience/gi, 'PROFESSIONAL EXPERIENCE');
  optimized = optimized.replace(/education/gi, 'EDUCATION');
  optimized = optimized.replace(/skills|technical skills/gi, 'TECHNICAL SKILLS');

  // Normalize whitespace
  optimized = optimized.replace(/\s+/g, ' ').trim();

  return optimized;
}
