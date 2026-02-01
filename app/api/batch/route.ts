import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { queue } from '@/lib/queue/processor';
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

    const { job_urls, alignment_level, export_format, generate_cv, generate_cover } =
      await request.json();

    if (!job_urls || !Array.isArray(job_urls) || job_urls.length === 0) {
      return NextResponse.json({ error: 'Job URLs required' }, { status: 400 });
    }

    const jobIds: string[] = [];

    // Process each job URL
    for (const url of job_urls) {
      const jobId = await queue.add('analyze_and_generate', user.id, {
        url,
        alignment_level: alignment_level || 50,
        export_format: export_format || 'generic',
        generate_cv: generate_cv !== false,
        generate_cover: generate_cover !== false,
      });

      jobIds.push(jobId);
    }

    return NextResponse.json({
      success: true,
      job_ids: jobIds,
      total: job_urls.length,
    });
  } catch (error: any) {
    logger.error('Error in batch route', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
