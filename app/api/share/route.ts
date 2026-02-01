import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_id, expires_in_days } = await request.json();

    if (!document_id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    // Verify document belongs to user
    const { data: document, error: docError } = await supabase
      .from('generated_documents')
      .select('id')
      .eq('id', document_id)
      .eq('user_id', user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Generate share token
    const shareToken = crypto.randomBytes(32).toString('hex');

    // Calculate expiration
    const expiresAt = expires_in_days
      ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Create share link
    const { data: shareLink, error: shareError } = await supabase
      .from('shared_documents')
      .insert({
        document_id,
        share_token: shareToken,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (shareError) {
      logger.error('Error creating share link', { error: shareError });
      return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${shareToken}`;

    return NextResponse.json({
      success: true,
      share_url: shareUrl,
      share_token: shareToken,
      expires_at: expiresAt,
    });
  } catch (error: any) {
    logger.error('Error in share route', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
