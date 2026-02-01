import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAIWithFallback, OPENAI_MODEL } from '@/lib/openai/client';
import { researchCompany } from '@/lib/ai/company-research';
import { calculateMatchingScore } from '@/lib/matching/score-calculator';
import { jobPostingSchema } from '@/lib/validation/schemas';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = jobPostingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error },
        { status: 400 }
      );
    }

    let jobDescription = '';
    let company = '';
    let title = '';

    // Fetch job posting if URL provided
    if (validation.data.url) {
      try {
        // In production, use a proper web scraper or API
        const response = await fetch(validation.data.url);
        const html = await response.text();
        // Extract job description from HTML (simplified)
        // In production, use a proper HTML parser
        jobDescription = html.substring(0, 5000); // Placeholder
      } catch (error) {
        logger.error('Error fetching job URL', { error, url: validation.data.url });
      }
    } else if (validation.data.description) {
      jobDescription = validation.data.description;
    }

    // Extract job information using AI
    const extractPrompt = `Extract the following from this job posting:

1. Job title
2. Company name
3. Required skills (array)
4. Experience level (entry/mid/senior/lead)
5. Experience years required
6. Education requirements (array)
7. Responsibilities (array)
8. Preferred qualifications (array)

Job Posting:
${jobDescription}

Return ONLY valid JSON:
{
  "title": "...",
  "company": "...",
  "requirements": {
    "skills": [...],
    "experience_level": "...",
    "experience_years": ...,
    "education": [...],
    "responsibilities": [...],
    "preferred_qualifications": [...]
  }
}`;

    const extractResponse = await callAIWithFallback(
      [
        {
          role: 'system',
          content: 'Extract structured information from job postings. Return only valid JSON.',
        },
        {
          role: 'user',
          content: extractPrompt,
        },
      ],
      {
        model: OPENAI_MODEL,
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }
    );

    const extracted = JSON.parse(extractResponse.choices[0].message.content || '{}');
    title = extracted.title || '';
    company = extracted.company || '';

    // Research company
    let companyInfo = null;
    if (company) {
      companyInfo = await researchCompany(company);
    }

    // Save job posting
    const { data: jobPosting, error: jobError } = await supabase
      .from('job_postings')
      .insert({
        user_id: user.id,
        url: validation.data.url || null,
        title,
        company,
        description: jobDescription,
        requirements: extracted.requirements || null,
        company_info: companyInfo,
      })
      .select()
      .single();

    if (jobError) {
      logger.error('Error saving job posting', { error: jobError });
      return NextResponse.json({ error: 'Failed to save job posting' }, { status: 500 });
    }

    // Calculate matching score
    const matchingScore = await calculateMatchingScore(user.id, jobPosting);

    // Save matching score
    await supabase.from('job_matching_scores').insert({
      user_id: user.id,
      job_posting_id: jobPosting.id,
      overall_score: matchingScore.overall_score,
      skills_match: matchingScore.skills_match,
      experience_match: matchingScore.experience_match,
      education_match: matchingScore.education_match,
      culture_fit: matchingScore.culture_fit,
      match_details: matchingScore.match_details,
    });

    return NextResponse.json({
      success: true,
      job_posting: jobPosting,
      matching_score: matchingScore,
    });
  } catch (error: any) {
    logger.error('Error in job analysis route', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
