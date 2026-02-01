import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateCV, generateCoverLetter } from '@/lib/ai/generation';
import { generateDocumentSchema } from '@/lib/validation/schemas';
import { uploadFile } from '@/lib/storage/upload';
import { trackEvent } from '@/lib/analytics/tracker';
import { logger } from '@/lib/logger';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Support guest mode
    const isGuest = !user && request.headers.get('x-guest-mode') === 'true';
    const guestId = request.headers.get('x-guest-id');
    
    if (!user && !isGuest) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // For guest mode, allow non-UUID job posting IDs
    let validation;
    if (isGuest) {
      // Relax validation for guest mode
      validation = {
        success: true,
        data: {
          job_posting_id: body.job_posting_id,
          generate_cv: body.generate_cv !== false,
          generate_cover: body.generate_cover !== false,
          alignment_level: body.alignment_level || '50',
          export_format: body.export_format || 'generic',
        },
      };
    } else {
      validation = generateDocumentSchema.safeParse(body);
    }

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error },
        { status: 400 }
      );
    }

    // Get job posting
    let jobPosting: any;
    if (isGuest) {
      // For guest mode, job posting should be passed in the request or retrieved from a cache
      // For now, we'll expect it to be in the body
      jobPosting = body.job_posting || null;
      if (!jobPosting) {
        return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
      }
    } else {
      const { data: savedJob, error: jobError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', validation.data.job_posting_id)
        .single();

      if (jobError || !savedJob) {
        return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
      }
      jobPosting = savedJob;
    }

    const alignmentLevel = parseInt(validation.data.alignment_level) as 10 | 30 | 50 | 70 | 90;
    const userId = user?.id || `guest-${guestId}`;

    // Get guest materials and profile if in guest mode
    let guestMaterials: any[] = [];
    let guestProfileData: any = null;
    if (isGuest && guestId) {
      // Guest materials and profile are passed in the request body
      guestMaterials = body.guest_materials || [];
      guestProfileData = body.guest_profile || null;
    }

    // Generate CV if requested
    let cvContent = null;
    let cvCitations: any[] = [];
    let cvPdfUrl = null;

    if (validation.data.generate_cv) {
      const cvResult = await generateCV(
        userId,
        validation.data.job_posting_id,
        alignmentLevel,
        jobPosting,
        isGuest,
        guestMaterials,
        guestProfileData
      );
      cvContent = cvResult.content;
      cvCitations = cvResult.citations;
    }

    // Generate cover letter if requested
    let coverContent = null;
    let coverCitations: any[] = [];
    let coverPdfUrl = null;

    if (validation.data.generate_cover) {
      const coverResult = await generateCoverLetter(
        userId,
        validation.data.job_posting_id,
        alignmentLevel,
        jobPosting,
        isGuest,
        guestMaterials,
        guestProfileData
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

    let document: any;
    if (isGuest) {
      // For guest mode, create document in memory
      document = {
        id: `guest-doc-${Date.now()}`,
        user_id: userId,
        job_posting_id: jobPosting.id,
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
        created_at: new Date().toISOString(),
      };
    } else {
      // Save to database for authenticated users
      const { data: savedDoc, error: docError } = await supabase
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
      document = savedDoc;

      // Track event
      await trackEvent(user.id, 'document_generated', {
        document_id: document.id,
        type: documentType,
        alignment_level: alignmentLevel,
      });
    }

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
