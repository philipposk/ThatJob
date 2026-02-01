import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { feedbackSchema } from '@/lib/validation/schemas';
import { trackEvent } from '@/lib/analytics/tracker';
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
    const validation = feedbackSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error },
        { status: 400 }
      );
    }

    // Verify document belongs to user
    const { data: document, error: docError } = await supabase
      .from('generated_documents')
      .select('id')
      .eq('id', validation.data.document_id)
      .eq('user_id', user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Update document with feedback
    const { error: updateError } = await supabase
      .from('generated_documents')
      .update({
        feedback_rating: validation.data.rating,
        feedback_comment: validation.data.comment || null,
      })
      .eq('id', validation.data.document_id);

    if (updateError) {
      logger.error('Error saving feedback', { error: updateError });
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    // Track event
    await trackEvent(user.id, 'feedback', {
      document_id: validation.data.document_id,
      rating: validation.data.rating,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('Error in feedback route', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
