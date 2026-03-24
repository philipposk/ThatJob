import { callAIWithFallback, OPENAI_MODEL } from '../openai/client';
import { extractUserProfile } from './learning';
import { researchCompany } from './company-research';
import { getUserProfile, type UserProfile } from '../profile/get-profile';
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

const DOCUMENT_GUARDRAILS = `
NON-NEGOTIABLE OUTPUT RULES:
- Output must be ship-ready and directly usable in an application.
- Never include website chrome, navigation text, page labels, recruiter instructions, or scraped boilerplate.
- Never include lines such as "Apply now", "Back to search results", "More about the role...", "Set alert", "Save", "Easy Apply", "Learn more", or similar UI text.
- Never mention where the user found the job posting unless explicitly asked.
- Never add meta commentary, drafting notes, placeholders, or explanations to the document body.
- Never invent details, tone, enthusiasm, claims, or qualifications not supported by user materials.
- Prefer simple, direct sentences over flowery language.
- Avoid repetition. Do not repeat the same project, website, GitHub link, or portfolio reference in multiple places unless it is necessary.
- Mention portfolio or GitHub at most once in a cover letter, usually near the end.
`;

function sanitizeGeneratedDocument(content: string): string {
  if (!content) return '';

  const forbiddenLinePatterns = [
    /^skip to content$/i,
    /^apply now$/i,
    /^save$/i,
    /^easy apply$/i,
    /^responses managed off linkedin$/i,
    /^set alert for similar jobs$/i,
    /^back to search results$/i,
    /^learn more$/i,
    /^questions\?$/i,
    /^visit our help center\.?$/i,
    /^more about the role.*$/i,
    /^linkedin corporation.*$/i,
    /^try premium.*$/i,
  ];

  const forbiddenInlinePatterns = [
    /More about the role is listed on .*$/gi,
    /< Back to search results/gi,
    /Responses managed off LinkedIn/gi,
  ];

  const cleanedLines = content
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => !forbiddenLinePatterns.some((pattern) => pattern.test(line.trim())));

  const cleanedContent = cleanedLines.join('\n');
  const withoutInlineArtifacts = forbiddenInlinePatterns.reduce(
    (text, pattern) => text.replace(pattern, ''),
    cleanedContent
  );

  return withoutInlineArtifacts
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function formatCurrentDate(): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Europe/Copenhagen',
  }).format(new Date());
}

function buildCoverLetterHeader(profileData: UserProfile | null): string {
  if (!profileData) return '';

  const lines = [
    profileData.full_name?.trim(),
    profileData.address && profileData.postal_code && profileData.city && profileData.country
      ? `${profileData.address}, ${profileData.postal_code} ${profileData.city}, ${profileData.country}`
      : null,
    [profileData.email, profileData.phone].filter(Boolean).join(' | ') || null,
    formatCurrentDate(),
  ].filter(Boolean);

  return lines.join('\n');
}

export async function generateCV(
  userId: string,
  jobPostingId: string,
  alignmentLevel: AlignmentLevel,
  jobPosting?: JobPosting,
  isGuest: boolean = false,
  guestMaterials?: any[],
  guestProfileData?: any
): Promise<{ content: string; citations: Citation[] }> {
  try {
    const userProfile = await extractUserProfile(userId, isGuest, guestMaterials);
    const profileData = await getUserProfile(userId, isGuest, guestProfileData);
    
    // Use provided job posting or fetch from DB
    let job: JobPosting;
    if (jobPosting) {
      job = jobPosting;
    } else {
      // Fetch from database for authenticated users
      const { createClient } = await import('../supabase/server');
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', jobPostingId)
        .single();
      
      if (error || !data) {
        throw new Error('Job posting not found');
      }
      
      job = {
        id: data.id,
        user_id: data.user_id,
        url: data.url,
        title: data.title,
        company: data.company,
        description: data.description,
        requirements: data.requirements,
        company_info: data.company_info,
        created_at: data.created_at,
      };
    }

    const companyInfo = job.company
      ? await researchCompany(job.company)
      : (job.company_info || {
          name: '',
          values: [],
          culture: [],
          mission: null,
          recent_news: [],
          ethics: [],
        });

    // Build contact information section
    const contactInfo = profileData ? `
Contact Information:
- Name: ${profileData.full_name || '[User Name]'}
- Email: ${profileData.email || '[User Email]'}
- Phone: ${profileData.phone || '[User Phone]'}
- LinkedIn: ${profileData.linkedin_url || '[User LinkedIn]'}
- GitHub: ${profileData.github_url || '[User GitHub]'}
- Portfolio: ${profileData.portfolio_url || '[User Portfolio]'}
- Address: ${profileData.address ? `${profileData.address}, ${profileData.postal_code || ''} ${profileData.city || ''}, ${profileData.country || ''}` : '[User Address]'}
` : '';

    // Build languages section
    const languagesInfo = profileData?.languages && profileData.languages.length > 0
      ? `Languages: ${profileData.languages.map(l => `${l.language} (${l.level})`).join(', ')}`
      : '';

    // Use education_details from profile if available, otherwise use extracted education
    const educationInfo = profileData?.education_details && profileData.education_details.length > 0
      ? JSON.stringify(profileData.education_details.map(edu => ({
          degree: edu.degree,
          institution: edu.institution,
          field: edu.field,
          start_date: edu.start_date,
          end_date: edu.end_date,
          gpa: edu.gpa,
          thesis: edu.thesis,
          courses: edu.courses || [],
        })))
      : JSON.stringify(userProfile.education || []);

    const prompt = `Generate a professional CV for a job application.

User Profile:
- Skills: ${userProfile.skills.join(', ') || 'To be extracted from materials'}
- Experience: ${JSON.stringify(userProfile.experience) || '[]'}
- Education: ${educationInfo}
- Projects: ${JSON.stringify(userProfile.projects) || '[]'}
- Summary: ${userProfile.summary || 'To be generated from materials'}
${languagesInfo ? `- ${languagesInfo}` : ''}

${contactInfo}

Job Requirements:
${job.description || 'Not specified'}

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

${DOCUMENT_GUARDRAILS}

Generate a CV following this structure:
1. Profile (3-4 sentences)
2. Contact Information (use the provided contact information exactly)
3. Education (use education_details from profile if available, otherwise use extracted education)
4. Languages (if provided)
5. Technical Skills (categorized)
6. Projects (reordered by relevance to job)
7. Experience

IMPORTANT:
- All information must be verifiable from the user's materials
- Include citations in format: [Source: material_type, line: X] for each claim
- Use the exact contact information provided above
- Keep to 1 page
- Use professional, direct language
- No corporate jargon or fluff
- Match alignment level appropriately
- Return only the final CV text in `cv_content`, with no extra notes before or after it

Return JSON:
{
  "cv_content": "full CV text",
  "citations": [
    {"section": "Profile", "claim": "...", "source": "user_cv.pdf", "line": 5}
  ]
}`;

    const response = await callAIWithFallback(
      [
        {
          role: 'system',
          content:
            'You are an expert CV writer. Generate professional, authentic, ship-ready CVs based on user materials. Exclude webpage boilerplate, UI text, and meta commentary. Always cite sources. Return only valid JSON.',
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
      content: sanitizeGeneratedDocument(result.cv_content || ''),
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
  alignmentLevel: AlignmentLevel,
  jobPosting?: JobPosting,
  isGuest: boolean = false,
  guestMaterials?: any[],
  guestProfileData?: any
): Promise<{ content: string; citations: Citation[] }> {
  try {
    const userProfile = await extractUserProfile(userId, isGuest, guestMaterials);
    const profileData = await getUserProfile(userId, isGuest, guestProfileData);
    
    // Use provided job posting or fetch from DB
    let job: JobPosting;
    if (jobPosting) {
      job = jobPosting;
    } else {
      const { createClient } = await import('../supabase/server');
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', jobPostingId)
        .single();
      
      if (error || !data) {
        throw new Error('Job posting not found');
      }
      
      job = {
        id: data.id,
        user_id: data.user_id,
        url: data.url,
        title: data.title,
        company: data.company,
        description: data.description,
        requirements: data.requirements,
        company_info: data.company_info,
        created_at: data.created_at,
      };
    }

    const companyInfo = job.company
      ? await researchCompany(job.company)
      : (job.company_info || {
          name: '',
          values: [],
          culture: [],
          mission: null,
          recent_news: [],
          ethics: [],
        });
    
    const coverLetterHeader = buildCoverLetterHeader(profileData);

    // Similar structure to CV generation
    const prompt = `Generate a professional cover letter following this structure:
1. Top-left header block
2. Greeting
3. Intro (fit + why job)
4. 2-3 paragraphs (skills/projects mapped to requirements)
5. Close

User Profile:
- Skills: ${userProfile.skills.join(', ') || 'To be extracted from materials'}
- Experience: ${JSON.stringify(userProfile.experience) || '[]'}
- Education: ${JSON.stringify(userProfile.education) || '[]'}
- Projects: ${JSON.stringify(userProfile.projects) || '[]'}
- Summary: ${userProfile.summary || 'To be generated from materials'}

Cover Letter Header (use exactly, preserve spelling and Unicode characters):
${coverLetterHeader || '[No header available]'}

Job Requirements:
${job.description || 'Not specified'}

Company Information:
- Values: ${companyInfo.values?.join(', ') || 'Not specified'}
- Culture: ${companyInfo.culture?.join(', ') || 'Not specified'}
- Mission: ${companyInfo.mission || 'Not specified'}

Alignment Level: ${alignmentLevel}%
- 10%: Minimal company references, focus on skills
- 30%: Light references to company values where applicable
- 50%: Balanced approach
- 70%: Strong value alignment
- 90%: Deep cultural alignment (all claims verifiable)

${DOCUMENT_GUARDRAILS}

Tone: Direct, honest, confident
Reference job specifics and company minimally
All claims must be verifiable from user materials
- If the job posting includes a specific recruiter, hiring manager, or contact person by name, use that name in the greeting (for example, "Dear Alex Morgan," — use only a name that actually appears in the job posting).
- Only use generic greetings like "Dear Hiring Team," when no specific contact name is provided.
- Include the exact header block at the very top of the cover letter when available
- Put the current date exactly as provided in the header block
- Do not rewrite, anglicize, or ASCII-normalize names or addresses
- Return only the final cover letter text in \`cover_content\`, with no extra notes before or after it

Return JSON:
{
  "cover_content": "full cover letter text",
  "citations": [
    {"section": "Intro", "claim": "...", "source": "material_type", "line": 5}
  ]
}`;

    const response = await callAIWithFallback(
      [
        {
          role: 'system',
          content:
            'You are an expert cover letter writer. Generate authentic, professional, ship-ready cover letters. Exclude webpage boilerplate, UI text, and meta commentary. Always cite sources. Return only valid JSON.',
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
      content: sanitizeGeneratedDocument(result.cover_content || ''),
      citations: result.citations || [],
    };
  } catch (error: any) {
    logger.error('Error generating cover letter', { error, userId, jobPostingId });
    throw new Error('Failed to generate cover letter');
  }
}
