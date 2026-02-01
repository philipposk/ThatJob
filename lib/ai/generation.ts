import { callAIWithFallback, OPENAI_MODEL } from '../openai/client';
import { extractUserProfile } from './learning';
import { researchCompany } from './company-research';
import type { AlignmentLevel, Citation } from '@/types/document';
import type { JobPosting, CompanyInfo } from '@/types/job';
import { logger } from '../logger';

interface GenerationContext {
  userProfile: any;
  jobPosting: JobPosting;
  companyInfo: CompanyInfo;
  alignmentLevel: AlignmentLevel;
  citations: Citation[];
}

export async function generateCV(
  userId: string,
  jobPostingId: string,
  alignmentLevel: AlignmentLevel
): Promise<{ content: string; citations: Citation[] }> {
  try {
    const userProfile = await extractUserProfile(userId);
    
    // Get job posting (would need to fetch from DB)
    // For now, using placeholder
    const jobPosting: JobPosting = {
      id: jobPostingId,
      user_id: userId,
      url: null,
      title: null,
      company: null,
      description: null,
      requirements: null,
      company_info: null,
      created_at: new Date().toISOString(),
    };

    const companyInfo = jobPosting.company
      ? await researchCompany(jobPosting.company)
      : {
          name: '',
          values: [],
          culture: [],
          mission: null,
          recent_news: [],
          ethics: [],
        };

    const prompt = `Generate a professional CV for a job application. 

User Profile:
- Skills: ${userProfile.skills.join(', ')}
- Experience: ${JSON.stringify(userProfile.experience)}
- Education: ${JSON.stringify(userProfile.education)}
- Projects: ${JSON.stringify(userProfile.projects)}
- Summary: ${userProfile.summary}

Job Requirements:
${jobPosting.description || 'Not specified'}

Company Information:
- Values: ${companyInfo.values.join(', ')}
- Culture: ${companyInfo.culture.join(', ')}
- Mission: ${companyInfo.mission || 'Not specified'}

Alignment Level: ${alignmentLevel}%
- 10%: Minimal company references, focus on skills
- 30%: Light references to company values where applicable
- 50%: Balanced approach
- 70%: Strong value alignment
- 90%: Deep cultural alignment (all claims verifiable)

Generate a CV following this structure:
1. Profile (3-4 sentences)
2. Contact Information
3. Education
4. Technical Skills (categorized)
5. Projects (reordered by relevance to job)
6. Experience

IMPORTANT:
- All information must be verifiable from the user's materials
- Include citations in format: [Source: material_type, line: X] for each claim
- Keep to 1 page
- Use professional, direct language
- No corporate jargon or fluff
- Match alignment level appropriately

Return JSON:
{
  "cv_content": "full CV text",
  "citations": [
    {"section": "Profile", "claim": "...", "source": "CV_HBK.pdf", "line": 5}
  ]
}`;

    const response = await callAIWithFallback(
      [
        {
          role: 'system',
          content:
            'You are an expert CV writer. Generate professional, authentic CVs based on user materials. Always cite sources. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        model: OPENAI_MODEL,
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }
    );

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      content: result.cv_content || '',
      citations: result.citations || [],
    };
  } catch (error: any) {
    logger.error('Error generating CV', { error, userId, jobPostingId });
    throw new Error('Failed to generate CV');
  }
}

export async function generateCoverLetter(
  userId: string,
  jobPostingId: string,
  alignmentLevel: AlignmentLevel
): Promise<{ content: string; citations: Citation[] }> {
  try {
    const userProfile = await extractUserProfile(userId);
    
    // Similar structure to CV generation
    const prompt = `Generate a professional cover letter following this structure:
1. Greeting
2. Intro (fit + why job)
3. 2-3 paragraphs (skills/projects mapped to requirements)
4. Close

Alignment Level: ${alignmentLevel}%
Tone: Direct, honest, confident
Reference job specifics and company minimally
All claims must be verifiable from user materials

Return JSON with content and citations.`;

    const response = await callAIWithFallback(
      [
        {
          role: 'system',
          content:
            'You are an expert cover letter writer. Generate authentic, professional cover letters. Always cite sources. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        model: OPENAI_MODEL,
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }
    );

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      content: result.cover_content || '',
      citations: result.citations || [],
    };
  } catch (error: any) {
    logger.error('Error generating cover letter', { error, userId, jobPostingId });
    throw new Error('Failed to generate cover letter');
  }
}
