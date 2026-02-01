import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateMatchingScore } from '@/lib/matching/score-calculator';
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

    const { job_posting_id } = await request.json();

    if (!job_posting_id) {
      return NextResponse.json({ error: 'Job posting ID required' }, { status: 400 });
    }

    // Get job posting
    const { data: jobPosting, error: jobError } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', job_posting_id)
      .eq('user_id', user.id)
      .single();

    if (jobError || !jobPosting) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
    }

    // Calculate matching score
    const matchingScore = await calculateMatchingScore(user.id, jobPosting);

    // Save or update matching score
    const { error: upsertError } = await supabase
      .from('job_matching_scores')
      .upsert(
        {
          user_id: user.id,
          job_posting_id,
          overall_score: matchingScore.overall_score,
          skills_match: matchingScore.skills_match,
          experience_match: matchingScore.experience_match,
          education_match: matchingScore.education_match,
          culture_fit: matchingScore.culture_fit,
          match_details: matchingScore.match_details,
        },
        { onConflict: 'user_id,job_posting_id' }
      );

    if (upsertError) {
      logger.error('Error saving matching score', { error: upsertError });
    }

    return NextResponse.json({
      success: true,
      matching_score: matchingScore,
    });
  } catch (error: any) {
    logger.error('Error in matching route', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
