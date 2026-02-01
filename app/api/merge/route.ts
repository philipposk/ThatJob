import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateMergedPDF } from '@/lib/pdf/generator';
import { renderToStream } from '@react-pdf/renderer';
import { uploadFile } from '@/lib/storage/upload';
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

    const { document_id } = await request.json();

    if (!document_id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    // Get document
    const { data: document, error: docError } = await supabase
      .from('generated_documents')
      .select('*')
      .eq('id', document_id)
      .eq('user_id', user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (!document.cv_content || !document.cover_content) {
      return NextResponse.json(
        { error: 'Both CV and cover letter required for merge' },
        { status: 400 }
      );
    }

    // Generate merged PDF
    const pdfDoc = generateMergedPDF(document);
    const stream = await renderToStream(pdfDoc);
    
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    // Upload merged PDF
    const file = new File([pdfBuffer], `merged-${document_id}.pdf`, {
      type: 'application/pdf',
    });
    const pdfUrl = await uploadFile(user.id, file, 'generated-documents');

    // Update document with merged PDF URL
    const { error: updateError } = await supabase
      .from('generated_documents')
      .update({ merged_pdf_url: pdfUrl })
      .eq('id', document_id);

    if (updateError) {
      logger.error('Error updating document with merged PDF', { error: updateError });
      return NextResponse.json({ error: 'Failed to save merged PDF' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      merged_pdf_url: pdfUrl,
    });
  } catch (error: any) {
    logger.error('Error in merge route', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
