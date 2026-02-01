import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateCV, generateCoverLetter } from '@/lib/ai/generation';
import { generateDocumentSchema } from '@/lib/validation/schemas';
import { uploadFile } from '@/lib/storage/upload';
import { trackEvent } from '@/lib/analytics/tracker';
import { logger } from '@/lib/logger';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';

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
    const validation = generateDocumentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error },
        { status: 400 }
      );
    }

    // Get job posting
    const { data: jobPosting, error: jobError } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', validation.data.job_posting_id)
      .single();

    if (jobError || !jobPosting) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
    }

    const alignmentLevel = parseInt(validation.data.alignment_level) as 10 | 30 | 50 | 70 | 90;

    // Generate CV if requested
    let cvContent = null;
    let cvCitations: any[] = [];
    let cvPdfUrl = null;

    if (validation.data.generate_cv) {
      const cvResult = await generateCV(user.id, validation.data.job_posting_id, alignmentLevel);
      cvContent = cvResult.content;
      cvCitations = cvResult.citations;

      // Generate PDF (simplified - would use proper PDF generation)
      // For now, just save the content
    }

    // Generate cover letter if requested
    let coverContent = null;
    let coverCitations: any[] = [];
    let coverPdfUrl = null;

    if (validation.data.generate_cover) {
      const coverResult = await generateCoverLetter(
        user.id,
        validation.data.job_posting_id,
        alignmentLevel
      );
      coverContent = coverResult.content;
      coverCitations = coverResult.citations;
    }

    // Save generated document
    const documentType = validation.data.generate_cv && validation.data.generate_cover
      ? 'both'
      : validation.data.generate_cv
      ? 'cv'
      : 'cover_letter';

    const { data: document, error: docError } = await supabase
      .from('generated_documents')
      .insert({
        user_id: user.id,
        job_posting_id: validation.data.job_posting_id,
        type: documentType,
        cv_content: cvContent,
        cover_content: coverContent,
        alignment_score: alignmentLevel,
        citations: [...cvCitations, ...coverCitations],
        iterations: [
          {
            version: 1,
            content: { cv: cvContent, cover: coverContent },
            timestamp: new Date().toISOString(),
            changes: ['Initial generation'],
            alignment_score: alignmentLevel,
          },
        ],
      })
      .select()
      .single();

    if (docError) {
      logger.error('Error saving document', { error: docError });
      return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
    }

    // Track event
    await trackEvent(user.id, 'document_generated', {
      document_id: document.id,
      type: documentType,
      alignment_level: alignmentLevel,
    });

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error: any) {
    logger.error('Error in generate route', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
