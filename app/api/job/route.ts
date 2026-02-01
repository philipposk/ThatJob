import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAIWithFallback, OPENAI_MODEL } from '@/lib/openai/client';
import { researchCompany } from '@/lib/ai/company-research';
import { calculateMatchingScore } from '@/lib/matching/score-calculator';
import { jobPostingSchema } from '@/lib/validation/schemas';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Support guest mode - check if guest_mode header is set
    const isGuest = !user && request.headers.get('x-guest-mode') === 'true';
    const userId = user?.id || `guest-${request.headers.get('x-guest-id') || 'unknown'}`;

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
        // Try to fetch the URL
        const response = await fetch(validation.data.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ThatJob/1.0)',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        // Try to extract text content (basic approach)
        // Remove script and style tags
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Use first 10000 characters (increased from 5000)
        jobDescription = textContent.substring(0, 10000);
        
        if (!jobDescription || jobDescription.length < 100) {
          throw new Error('Could not extract meaningful content from URL. Please paste the job description text instead.');
        }
      } catch (error: any) {
        logger.error('Error fetching job URL', { error, url: validation.data.url });
        return NextResponse.json(
          { 
            error: error.message || 'Failed to fetch job URL. Please paste the job description text instead.',
            details: 'Some websites block automated access. Try copying and pasting the job description text directly.'
          },
          { status: 400 }
        );
      }
    } else if (validation.data.description) {
      jobDescription = validation.data.description;
      
      if (!jobDescription || jobDescription.trim().length < 50) {
        return NextResponse.json(
          { error: 'Job description is too short. Please provide at least 50 characters.' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Either URL or description is required' },
        { status: 400 }
      );
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

    // Save job posting (skip for guest mode, return in-memory object)
    let jobPosting: any;
    if (isGuest) {
      // For guest mode, create a temporary job posting object
      jobPosting = {
        id: `guest-job-${Date.now()}`,
        user_id: userId,
        url: validation.data.url || null,
        title,
        company,
        description: jobDescription,
        requirements: extracted.requirements || null,
        company_info: companyInfo,
        created_at: new Date().toISOString(),
      };
    } else {
      // Save to database for authenticated users
      const { data: savedJob, error: jobError } = await supabase
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
      jobPosting = savedJob;
    }

    // Calculate matching score (simplified for guest mode)
    let matchingScore: any;
    if (isGuest) {
      // For guest mode, return a basic matching score
      matchingScore = {
        overall_score: 75,
        skills_match: 80,
        experience_match: 70,
        education_match: 75,
        culture_fit: 70,
        match_details: { note: 'Guest mode - full analysis requires account' },
      };
    } else {
      matchingScore = await calculateMatchingScore(user.id, jobPosting);
      
      // Save matching score for authenticated users
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
    }

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
